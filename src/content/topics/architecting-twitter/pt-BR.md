---
title: "Arquitetando o Twitter"
slug: architecting-twitter
description: "Uma resolução completa de uma plataforma social no estilo Twitter — contas, tweets, follows, timelines, curtidas, respostas, retweets, mídia e busca — construída com Redis, MongoDB, Kafka, Elasticsearch e S3, e projetada para baixa latência com 100M+ usuários."
category: exemplos-praticos
order: 10
difficulty: intermediate
status: published
tags: [design-de-sistemas, twitter, timeline, fanout, redis, mongodb, kafka, elasticsearch, s3, cdn, cache, feed, estudo-de-caso]
updatedAt: "2026-07-24"
beginnerSummary: >-
  Projetar um sistema no estilo Twitter é, no fundo, um problema difícil embrulhado em vários
  pequenos: como mostrar a cada usuário uma timeline principal rápida e atualizada, com tweets de
  todos que ele segue — na escala de centenas de milhões de pessoas? O truque é separar as
  preocupações. O conteúdo do tweet vive num banco de dados (MongoDB aqui), mas a timeline que você
  de fato lê é servida de um cache em memória (Redis) para parecer instantânea. Ao publicar, a
  escrita é salva e um evento é jogado numa fila (Kafka); workers em segundo plano então espalham o
  tweet nas timelines em cache dos seguidores, indexam para busca (Elasticsearch) e atualizam
  contadores — tudo sem você esperar. Mídia (imagens, vídeo) nunca vai no banco de tweets; vai para o
  object storage (S3) e é entregue por uma CDN. A busca é um índice separado. Este é um sistema
  read-heavy (muito mais leituras que escritas), então quase toda decisão é sobre tornar as leituras
  baratas e empurrar o trabalho lento para segundo plano. Use o laboratório interativo acima para ver
  um tweet passar por cada etapa.
glossary:
  - term: Timeline principal (home timeline)
    definition: "O feed que o usuário vê ao abrir o app — tweets recentes de todas as contas que ele segue, do mais novo ao mais antigo. O subsistema mais difícil de deixar rápido em escala."
  - term: Fanout
    definition: "Entregar um tweet a muitos seguidores. Fanout-on-write empurra o tweet para a timeline de cada seguidor na publicação; fanout-on-read monta o feed quando ele é lido."
  - term: Fanout-on-write
    definition: "Pré-computar timelines: ao publicar um tweet, grava o id dele no feed em cache de cada seguidor. As leituras viram uma busca rápida; as escritas ficam caras para quem tem muitos seguidores."
  - term: Fanout-on-read
    definition: "Computar sob demanda: ao carregar o feed, puxa tweets recentes de todos que o usuário segue e junta. As escritas ficam baratas; as leituras ficam caras e repetitivas."
  - term: Fanout do apocalipse
    definition: "A amplificação de escrita quando uma megaconta (dezenas de milhões de seguidores) tweeta sob fanout-on-write — uma publicação dispara dezenas de milhões de escritas de timeline."
  - term: Sistema read-heavy
    definition: "Uma carga com muito mais leituras do que escritas. Timelines são lidas o tempo todo e escritas comparativamente pouco, então o design otimiza leituras e usa cache agressivamente."
  - term: Cache da timeline (Redis)
    definition: "Feeds pré-computados e dados quentes (contadores, ids de tweets recentes) mantidos em memória para a timeline responder em milissegundos, em vez de bater em vários stores."
  - term: Backbone de eventos (Kafka)
    definition: "Um log durável de eventos (tweet-created, like-created, follow-created) que desacopla o caminho de escrita rápido do trabalho lento downstream, como fanout, indexação e notificações."
  - term: Fonte da verdade
    definition: "O store autoritativo de um dado. A fonte da verdade dos tweets é o MongoDB; o Redis apenas cacheia visões derivadas e pode ser reconstruído a partir dele."
  - term: Chave do objeto (object key)
    definition: "O id único de um objeto de mídia no S3. O documento do tweet guarda essa chave (mais metadados) em vez dos bytes brutos da imagem ou vídeo."
  - term: Índice invertido
    definition: "A estrutura por trás da busca full-text: mapeia cada termo para os documentos que o contêm, permitindo busca rápida por palavra-chave e ranqueamento por relevância no Elasticsearch."
  - term: Invalidação de cache
    definition: "Remover ou atualizar dados em cache quando a verdade subjacente muda — por exemplo, expirar ou atualizar uma timeline em cache após um novo tweet ou unfollow."
references:
  - label: "Twitter Engineering — The Infrastructure Behind Twitter: Scale"
    url: https://blog.twitter.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-scale
  - label: "Twitter Engineering — Timelines at Scale (palestra InfoQ)"
    url: https://www.infoq.com/presentations/Twitter-Timeline-Scalability/
  - label: "Redis — documentação"
    url: https://redis.io/docs/latest/
  - label: "Apache Kafka — documentação"
    url: https://kafka.apache.org/documentation/
  - label: "MongoDB — documentação"
    url: https://www.mongodb.com/docs/
  - label: "Elasticsearch — guia definitivo"
    url: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
  - label: "Amazon S3 — documentação"
    url: https://docs.aws.amazon.com/s3/
---

> Use o laboratório acima para **construir a intuição na mão**: defina os requisitos, rastreie uma
> requisição pela arquitetura em camadas, e então publique um tweet, carregue uma timeline (cache
> frio e quente), envie mídia ao S3 e rode uma busca no Elasticsearch. As notas abaixo são a
> referência rápida — e um lembrete de que este é **um design razoável**, não o único correto.

## O problema

Projete uma plataforma social onde pessoas publicam mensagens curtas ("tweets"), seguem umas às
outras e abrem o app para ver uma **timeline principal** — um feed de tweets recentes de todos que
elas seguem. Some curtidas, respostas, retweets, mídia e busca, e faça tudo parecer instantâneo para
**100M+ usuários**.

A parte enganosamente difícil é a **timeline**. Todo o resto — guardar um tweet, seguir um usuário —
é simples isoladamente. Entregar um feed rápido, atualizado e personalizado para centenas de milhões
de pessoas, muitas seguindo milhares de contas, algumas seguidas por dezenas de milhões, é onde mora
o verdadeiro trabalho de design de sistemas.

## Requisitos funcionais

- **Contas e login** — cadastrar, autenticar, gerenciar um perfil.
- **Criar, editar, excluir tweets** — posts curtos, editáveis e removíveis.
- **Seguir usuários** — montar o grafo social que decide quem vê quem.
- **Timeline principal** — tweets recentes de quem se segue, do mais novo ao mais antigo.
- **Curtir, responder, retweetar** — engajamento que se espalha pela plataforma.
- **Busca** — encontrar tweets e usuários por palavra-chave.
- **Enviar mídia** — anexar imagens e vídeo aos tweets.

## Requisitos não funcionais

- **Escala** — 100M+ usuários; bilhões de leituras de timeline por dia.
- **Alto volume de escrita** — enxurradas de tweets, curtidas, retweets, respostas e buscas.
- **Alta disponibilidade** — o feed continua no ar enquanto partes individuais falham.
- **Baixa latência** — a timeline principal precisa parecer instantânea.
- **Segurança e privacidade** — proteger contas, tokens e dados privados.
- **Observabilidade e recuperação** — enxergar o que acontece; recuperar rápido de falhas.

## Arquitetura de alto nível

Uma requisição flui **de cima para baixo** (rastreie no mapa acima):

1. **Cliente** (web / iOS / Android) faz uma requisição HTTPS.
2. **CDN** serve mídia em cache e assets estáticos da borda; um **load balancer** distribui o
   tráfego dinâmico entre as instâncias da aplicação.
3. **API Gateway** autentica o chamador, aplica **rate limits**, valida a entrada e roteia para o
   serviço certo.
4. **Serviços** — unidades pequenas que escalam de forma independente: Auth/IAM, Perfil, Tweet,
   Reply, Timeline, Fanout, Grafo de follow, Like/engajamento, Busca, Mídia, Notificação.
5. **Dados e backbone de eventos** — **Redis** (cache/dados quentes), **MongoDB** (conteúdo dos
   tweets), **Kafka** (eventos), **Elasticsearch** (busca), **S3** (mídia).

Cada serviço é dono dos seus dados e escala no próprio eixo: o serviço de **Timeline**, read-heavy,
escala de forma bem diferente do de **Busca** ou do de **Tweet** (caminho de escrita).

## Componentes centrais — e por quê cada um

- **Redis — cache da timeline e dados quentes.** A timeline é lida muito mais do que escrita, então
  feeds pré-computados, contadores (curtidas/retweets) e buscas quentes ficam em memória para
  leituras em poucos ms. O Redis é uma **camada de cache e dados quentes, não a fonte da verdade**
  dos tweets.
- **MongoDB — conteúdo de tweets e respostas.** Tweets têm formato de documento (texto, autor,
  timestamps, refs de mídia, campos flexíveis). Um banco de documentos encaixa e escala por sharding
  no id do tweet/autor. É a escolha **base** — outros stores servem; o ponto é uma fonte da verdade
  escalável para conteúdo.
- **Kafka — backbone de eventos.** Toda escrita emite um evento (`tweet-created`, `reply-created`,
  `like-created`, `follow-created`, `media-linked`). O Kafka **desacopla** o caminho de escrita
  rápido do trabalho lento downstream, para os produtores continuarem rápidos e os consumidores
  escalarem de forma independente.
- **Elasticsearch — índice de busca.** Busca full-text em tweets/usuários precisa de **índice
  invertido** e ranqueamento por relevância. É uma camada **separada**, alimentada de forma
  assíncrona — não o banco de tweets consultado diretamente.
- **Amazon S3 — objetos de mídia.** Imagens e vídeo são blobs binários grandes, guardados de forma
  durável e barata como objetos; o documento do tweet mantém só a **chave do objeto**. Uma **CDN** os
  entrega rápido no mundo todo.

## Caminho de escrita — publicando um tweet

Rode o fluxo "Publicar tweet" acima. Só os dois primeiros passos são **síncronos**; tudo depois do
Kafka é **assíncrono**:

1. O **Gateway** autentica, aplica rate limit e valida a requisição.
2. **Persiste** o documento do tweet no **MongoDB** (a fonte da verdade).
3. **Publica** um evento `tweet-created` no **Kafka**. O caminho de escrita terminou — o cliente
   recebe um OK rápido.
4. O consumidor de **Fanout** empurra o id do tweet para as timelines em cache dos seguidores.
5. Os feeds no **Redis** ganham o novo tweet no topo.
6. O consumidor de **Busca** indexa o tweet no **Elasticsearch**.

Como fanout, atualização de cache e indexação acontecem fora do caminho de escrita, o usuário
**nunca espera** por eles. Se um consumidor downstream cair por um instante, o evento fica no Kafka e
é processado na recuperação — o tweet segue guardado com segurança.

## Caminho de leitura — carregando a timeline

Rode "Carregar timeline" acima com cache frio e quente:

1. O serviço de **Timeline** recebe a requisição.
2. Ele checa o **Redis** pelo feed pré-computado do usuário.
3. **Cache hit** → devolve a lista pronta em poucos milissegundos. Este é o caso comum.
4. **Cache miss** (cache frio, evicção, expiração) → reconstrói a partir do store de tweets e do
   grafo de follow, e então **repovoa o Redis** para a próxima leitura ser um hit.

Todo o design se curva para tornar o passo 3 a norma. Um cache quente transforma uma reconstrução em
vários stores numa única leitura em memória — a diferença entre um feed instantâneo e um que trava.

## Estratégias de timeline — fanout on write vs on read

Este é o **trade-off mais difícil** do sistema:

- **Fanout on write** — na publicação, empurra o id do tweet para a timeline pré-computada de cada
  seguidor. As leituras ficam baratíssimas (uma busca no Redis). Mas uma celebridade com 50M
  seguidores dispara **50M escritas por tweet** — o "fanout do apocalipse".
- **Fanout on read** — não pré-computa nada; monta o feed no carregamento, puxando tweets recentes de
  todos que o usuário segue. As escritas ficam baratas, mas as leituras ficam lentas e repetitivas
  para usuários ativos.

Sistemas reais são **híbridos**: fanout-on-write para a grande maioria das contas e fanout-on-read
(puxado no carregamento) para um punhado de megacontas, mesclado no feed em cache. Numa entrevista,
**escolha uma base e nomeie a exceção** — isso mostra que você entende a tensão.

## Caminho de mídia — S3 + CDN

Rode "Enviar mídia" acima. Mídia é uma **preocupação diferente** do conteúdo do tweet:

1. O cliente envia o arquivo para o serviço de **Mídia** — geralmente via **URL S3 pré-assinada**,
   para os bytes pularem o app tier inteiro.
2. O objeto é guardado de forma durável num bucket **S3** e recebe uma **chave de objeto**.
3. Só a **chave + metadados** fica no documento do tweet no MongoDB — **nunca os bytes**.
4. Leitores depois buscam a mídia na **borda CDN** mais próxima (a primeira requisição por região é um
   MISS para a origem S3; toda requisição depois é um HIT na borda).

Binários grandes nunca pertencem ao banco de tweets — inchariam armazenamento, backups e replicação
para dados que o banco nem consegue consultar.

## Caminho de busca — Elasticsearch

Rode a demo de busca acima. A busca é um **subsistema próprio**:

1. A consulta passa pelo **gateway** até o serviço de **Busca**.
2. O serviço consulta o **Elasticsearch**, que ranqueia os resultados por relevância usando o índice
   invertido.
3. Os resultados voltam ao cliente.

O índice é mantido em sincronia de forma **assíncrona** pelo Kafka (`tweet-created` → indexa). Em
escala, **a busca não pode ser acoplada diretamente ao banco de tweets** — um índice separado escala
sozinho e pode ser ajustado por relevância sem tocar no caminho de escrita.

## Segurança, monitoramento e operação

As preocupações operacionais são **parte do design**, não um detalhe posterior:

- **Autenticação e autorização** no gateway — quem chama e tem permissão?
- **Rate limiting** na borda para absorver picos e barrar abuso.
- **Validação de entrada** para rejeitar payloads malformados ou maliciosos cedo.
- **Criptografia** — TLS em trânsito, criptografia em repouso para dados armazenados.
- **Logs, métricas e alertas** — logs estruturados e alertas quando o SLO escorrega.
- **Health checks** para o balanceador rotear só para instâncias saudáveis.
- **Testes de carga e automatizados** para provar capacidade e pegar regressões.
- **Backup e recuperação** — snapshots mais replay do Kafka para nenhum dado se perder de vez.

## Trade-offs

- **Consistência vs latência** — a timeline é **eventualmente consistente** (um novo tweet aparece um
  instante depois). É uma troca aceitável por um feed instantâneo.
- **Frescor do cache** — caches quentes são rápidos, mas podem ficar velhos; invalidar após novos
  tweets e unfollows é trabalho contínuo.
- **Propagação assíncrona** — desacoplar com Kafka adiciona partes móveis e consistência eventual em
  troca de um caminho de escrita rápido e resiliente.
- **Separação de armazenamento** — separar conteúdo (MongoDB), cache (Redis), mídia (S3) e busca
  (Elasticsearch) aumenta a superfície operacional, mas deixa cada um escalar de forma independente.
- **Complexidade vs escalabilidade** — cada uma dessas escolhas troca simplicidade pela capacidade de
  chegar a centenas de milhões de usuários.

## Relevância em entrevista

- **Separe caminho de leitura do de escrita em voz alta.** "Este é um sistema read-heavy; vou
  otimizar a leitura da timeline e empurrar o trabalho lento para segundo plano."
- **Trate a timeline como problema de primeira classe.** Nomeie fanout-on-write vs on-read, o fanout
  do apocalipse e a resolução híbrida. É isso que o entrevistador quer ouvir.
- **Justifique cada store em uma linha** — Redis (cache do feed quente), MongoDB (fonte da verdade dos
  tweets), Kafka (backbone de eventos), Elasticsearch (índice de busca), S3 (mídia). Diga o que cada
  um **não** é: o Redis não é a fonte da verdade; mídia não fica no banco; busca não é o banco de
  tweets.
- **Explique por que o assíncrono ajuda** — o Kafka deixa a escrita voltar rápido, isola falhas e
  deixa fanout/indexação/notificações escalarem e recuperarem de forma independente.
- **Declare a troca de consistência** — o feed é eventualmente consistente, e tudo bem.
- **Apresente como um design razoável**, e então discuta onde escolheria diferente (por exemplo, um
  store relacional ou wide-column para conteúdo, timelines por pull etc.).

## Notas de aula

- O sistema inteiro é uma resposta a uma pergunta: **como servir uma timeline rápida em escala?**
- **Cacheie a timeline, enfileire os efeitos colaterais.** Leituras batem no Redis; escritas jogam um
  evento e voltam.
- **Separe preocupações**: conteúdo ≠ cache ≠ mídia ≠ busca. Cada um tem seu store e sua escala.
- O Redis é **quente e derivado**; o MongoDB é a **verdade**. Você sempre pode reconstruir o Redis a
  partir do Mongo.
- **Não existe arquitetura única correta** — esta é uma base defensável que você consegue explicar e
  adaptar.
