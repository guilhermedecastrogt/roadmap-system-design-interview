---
title: "Armazenamento de Dados"
slug: data-storage
description: "Onde arquivos grandes realmente vivem — por que bancos de dados não são o melhor lar para vídeos, fotos e blobs binários, e como sistemas de arquivos e object storage (buckets estilo S3, muitas vezes atrás de um CDN) cumprem esse papel."
category: blocos-fundamentais
order: 100
difficulty: beginner
status: published
tags: [data-storage, object-storage, sistema-de-arquivos, blob, s3, buckets, cdn, uploads, midia]
updatedAt: "2026-07-17"
beginnerSummary: >-
  Nem todo dado pertence a um banco de dados. Dados pequenos e estruturados que você
  consulta — usuários, pedidos, saldos — cabem perfeitamente em bancos. Mas arquivos
  binários grandes — vídeos, fotos, áudio, arquivos de log — costumam ficar melhor em outro
  lugar, com o banco guardando apenas um ponteiro e alguns metadados. As duas opções
  principais são: um sistema de arquivos (a hierarquia familiar de pastas e arquivos,
  geralmente em um servidor montado via rede como NFS, Amazon EFS ou Azure Files — simples e
  intuitivo, mas mais difícil de escalar para o tamanho da nuvem) e object storage (Amazon
  S3, Azure Blob Storage, Google Cloud Storage, MinIO — cada arquivo vira um objeto composto
  pelos dados binários mais metadados mais um ID único, guardado em um bucket com namespace
  plano e acessado via HTTP). Object storage é a escolha padrão para uploads de usuários e
  mídia porque é massivamente escalável, durável e barato — e combina naturalmente com um
  CDN para entregar arquivos rapidamente em qualquer lugar do mundo.
glossary:
  - term: Blob (binary large object)
    definition: "Um bloco de dados binários tratado como uma unidade — uma imagem, um vídeo, um arquivo compactado. Armazenado e servido inteiro; nunca consultado 'por dentro' como linhas de banco."
  - term: Sistema de arquivos
    definition: "Armazenamento organizado como hierarquia de pastas e arquivos, muitas vezes em outro servidor montado pela rede. Modelo mental simples; mais difícil de escalar para o tamanho da nuvem."
  - term: Compartilhamento de rede (NFS/SMB)
    definition: "Protocolos que permitem a servidores montarem um sistema de arquivos remoto como se fosse disco local. Versões gerenciadas incluem Amazon EFS, Azure Files e Google Cloud Filestore."
  - term: Object storage
    definition: "Armazenamento que guarda cada arquivo como um objeto — dados + metadados + ID único — dentro de um bucket, acessado via HTTP/REST. Exemplos: S3, Azure Blob Storage, GCS, MinIO."
  - term: Objeto
    definition: "A unidade do object storage: o payload binário, seus metadados (content-type, created_at, campos custom) e uma chave/ID única que o endereça."
  - term: Metadados
    definition: "Dados sobre o objeto — content-type, tamanho, data de criação, tags custom como user_id. Permitem que sistemas tratem arquivos corretamente sem abrir os bytes."
  - term: ID / chave do objeto
    definition: "O nome único que endereça um objeto em um bucket (um UUID ou uma string que parece caminho). O banco guarda esse ponteiro em vez dos bytes do arquivo."
  - term: Bucket
    definition: "O contêiner que guarda objetos no object storage. Seu namespace é plano — chaves podem parecer caminhos, mas não existem pastas de verdade."
  - term: Namespace plano
    definition: "Todas as chaves de objeto vivem em um nível só; 'uploads/2026/foto.jpg' é uma única string de chave, não uma foto dentro de pastas aninhadas."
  - term: URL pré-assinada (presigned URL)
    definition: "Um link temporário e assinado que permite ao cliente fazer upload ou download de um objeto direto do bucket, sem passar os bytes pelos seus servidores de aplicação."
  - term: CDN (Content Delivery Network)
    definition: "Uma rede de caches de borda (ex.: CloudFront) colocada na frente de uma origem — muitas vezes um bucket de object storage — para servir arquivos perto do usuário em vez de atravessar o globo."
  - term: Origem (origin)
    definition: "A fonte autoritativa que o CDN busca em um cache miss. Para mídia e assets estáticos, a origem tipicamente é o bucket de object storage."
references:
  - label: "Amazon S3 — documentação"
    url: https://docs.aws.amazon.com/s3/
  - label: "Azure Blob Storage — introdução"
    url: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction
  - label: "Google Cloud Storage — documentação"
    url: https://cloud.google.com/storage/docs
  - label: "MinIO — object storage open source"
    url: https://min.io/
  - label: "Amazon CloudFront com S3 — servindo conteúdo"
    url: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html
  - label: "AWS — Quando usar o Amazon EFS"
    url: https://docs.aws.amazon.com/efs/latest/ug/whentochoose.html
---

> Use o laboratório acima para **construir a intuição na mão**: combine cada tipo de dado
> com o armazenamento que se encaixa, alterne os mesmos seis arquivos entre uma árvore de
> pastas e um bucket plano, abra um objeto para ver dados + metadados + ID, depois faça o
> upload de um arquivo e baixe-o de três continentes com o CDN ligado e desligado. As notas
> abaixo são a referência rápida.

## O que é

"Armazenamento de dados" aqui significa a camada onde vivem os **dados em formato de
arquivo**: vídeos, fotos, áudio, arquivos de log, exports JSON, páginas HTML e outros
**blobs binários**. Bancos de dados continuam sendo o lar de registros estruturados — mas,
para arquivos grandes, dois outros modelos fazem o trabalho pesado: **sistemas de
arquivos** e **object storage**.

## Por que bancos de dados nem sempre são o melhor encaixe

Bancos de dados *podem* armazenar dados binários — a questão não é que eles "não
funcionam", e sim que muitas vezes **não são o melhor armazenamento primário para binários
grandes**:

- Um vídeo de 2 GB dentro de uma tabela incha **armazenamento, backups e replicação** para
  um dado que o banco nunca consegue consultar "por dentro".
- Bancos brilham com **linhas pequenas, estruturadas e consultadas com frequência** — não
  transmitindo gigabytes para um celular.
- O padrão consagrado: guarde o arquivo em outro lugar e mantenha no banco apenas a **chave
  do objeto/URL mais metadados pesquisáveis** (dono, tamanho, content-type).

## Sistema de arquivos

O modelo familiar: uma **hierarquia de pastas e arquivos**, muitas vezes em um servidor
dedicado montado pela rede (**NFS**, **SMB**) ou um compartilhamento gerenciado (**Amazon
EFS**, **Azure Files**, **Google Cloud Filestore**).

- **Pontos fortes** — modelo mental simples e intuitivo; organização clara em diretórios;
  aplicações usam como um disco local.
- **Limites** — escalar além de um servidor/volume fica difícil; não foi projetado para
  acesso HTTP de qualquer lugar; tetos de capacidade e vazão do compartilhamento.

Ótimo para muitos cenários (configs compartilhadas, apps legados, lift-and-shift) — mas
sistemas cloud-native servindo milhões de uploads eventualmente o superam.

## Object storage

O modelo cloud-native: cada arquivo é armazenado como um **objeto** dentro de um **bucket**
e acessado via **HTTP / REST**. Exemplos: **Amazon S3, Azure Blob Storage, Google Cloud
Storage, MinIO** (auto-hospedado).

### Anatomia do objeto

Um objeto tem exatamente três partes *(abra um no explorador acima)*:

- **Dados** — o payload binário em si (o blob): bytes de imagem, bytes de vídeo, um arquivo
  gzip.
- **Metadados** — dados sobre os dados: `content-type`, tamanho, `created_at` e campos
  custom como `user_id`.
- **ID / chave do objeto** — um identificador único (um UUID ou uma chave escolhida) que
  endereça o objeto.

### Buckets e o namespace plano

Objetos vivem em buckets — e um bucket é **conceitualmente plano**. Uma chave como
`uploads/2026/03/praia.jpg` é **uma única string**, não um arquivo dentro de pastas
aninhadas: as barras são só caracteres que deixam as listagens organizadas. Não existem
diretórios reais para criar, mover ou esgotar.

### Por que ele vence em escala

- **Massivamente escalável** — bilhões de objetos; nenhum volume para estourar.
- **Durável e barato** — projetado para várias cópias em hardwares diferentes, precificado
  para volume.
- **Nativo de HTTP** — todo objeto é endereçável por URL, de qualquer lugar.
- **Perfeito para uploads de usuários** — mídia, backups e conteúdo estático grande,
  servidos direto ou através de um CDN.

## Sistema de arquivos vs object storage

- **Hierarquia vs plano** — diretórios aninhados reais vs um espaço de chaves plano por
  bucket.
- **Acesso** — montado como disco (abrir/ler/escrever) vs requisições HTTP/REST.
- **Modelo mental** — sistema de arquivos é mais simples localmente; object storage se
  encaixa melhor em sistemas distribuídos em escala de nuvem.
- **Escala e custo** — compartilhamentos batem em tetos de servidor/volume; object stores
  escalam horizontalmente a baixo custo.
- **Quando usar cada um** — sistema de arquivos para semântica de disco compartilhado e
  compatibilidade legada; object storage para uploads, mídia, backups e tudo que é servido
  pela web.

## O pipeline de upload do usuário

O fluxo padrão *(rode no laboratório de upload acima)*:

1. O usuário envia uma foto ou vídeo para a aplicação.
2. A app transmite os bytes para o **bucket** (ou entrega ao cliente uma **URL
   pré-assinada** para upload direto).
3. O objeto é gravado com seus **metadados**, e um **ID/chave de objeto** o identifica.
4. O **banco guarda apenas a chave + metadados** — nunca os bytes.
5. Depois, o arquivo é servido direto do object storage — geralmente **através de um CDN**.

## Integração com CDN

Object storage combina naturalmente com um CDN (ex.: **CloudFront** na frente do S3):

- O bucket é a **origem**; o CDN mantém cópias em **pontos de presença** pelo mundo.
- Primeira requisição em uma região: **MISS** — a borda busca no bucket e guarda em cache.
- Toda requisição seguinte: **HIT** — servida de perto, cortando a latência de ~200 ms para
  ~25 ms e tirando carga da origem.

É assim que avatares, imagens de produto e segmentos de vídeo chegam rápido aos usuários em
qualquer lugar.

## Trade-offs

- **Simplicidade vs escala** — o modelo de sistema de arquivos é mais fácil de raciocinar;
  object storage troca familiaridade por escala praticamente ilimitada.
- **Perfil de latência** — discos locais/de rede vencem em leituras pequenas e aleatórias;
  object storage vence transmitindo arquivos grandes pela web.
- **Semântica** — sistemas de arquivos oferecem lock e edição in-place; object storage
  substitui objetos inteiros e não tem pastas reais.
- **Custo** — object storage costuma ser a opção durável mais barata para dados em volume;
  compartilhamentos custam mais por GB, mas se comportam como discos.

## Relevância em entrevistas

- **Diga o padrão em voz alta**: "Mídia vai para o object storage; o banco guarda a chave
  do objeto e os metadados." Essa frase única cobre a maioria das perguntas sobre upload.
- **Justifique o porquê** — binários grandes incham armazenamento, backups e replicação do
  banco, e o banco não consegue consultar dentro deles de qualquer forma.
- **Saiba a anatomia** — objeto = dados + metadados + ID único, em um bucket, namespace
  plano, acessado via HTTP. Metadados (content-type) são o que permite ao navegador
  renderizar o arquivo; o ID é o que o banco aponta.
- **Complete a história da entrega** — bucket como origem do CDN: a primeira busca por
  região é um MISS, depois HITs na borda servem os usuários de perto. Uploads via URLs
  pré-assinadas mantêm os bytes fora dos seus servidores de aplicação.
- **Nomeie os produtos** — S3 / Azure Blob / GCS / MinIO para objetos; NFS / SMB / EFS /
  Azure Files / Cloud Filestore para compartilhamentos de arquivos. (E se bancos de
  documentos surgirem na conversa: Firestore é um banco de documentos, não armazenamento de
  arquivos.)

## Notas de aula

- Regra de bolso: **se você nunca escreveria um WHERE sobre o conteúdo dele, provavelmente
  não pertence ao banco de dados.**
- A ilusão do bucket a desfazer: chaves parecem caminhos, mas o namespace é **plano** — sem
  pastas reais.
- Arquitetura padrão para uploads: **object storage + chave no banco + CDN na frente**.
- Compartilhamentos de arquivos não estão obsoletos — são a ferramenta certa quando apps
  genuinamente precisam de acesso compartilhado estilo disco.
