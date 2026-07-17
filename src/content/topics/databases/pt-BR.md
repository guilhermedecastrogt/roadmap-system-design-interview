---
title: "Bancos de Dados"
slug: databases
description: "Como escolher o banco certo para o contexto — SQL vs NoSQL com honestidade, stores especializados, arquiteturas poliglotas e trade-offs de consistência multi-região."
category: blocos-fundamentais
order: 90
difficulty: intermediate
status: published
tags: [databases, sql, nosql, cap-theorem, scalability, architecture, storage]
updatedAt: "2026-07-17"
beginnerSummary: >-
  Não existe um melhor banco de dados — a escolha certa depende do contexto: a forma do dado,
  o padrão de leitura/escrita, o orçamento de latência, a necessidade de consistência e onde
  estão os usuários. Bancos SQL (relacionais) são o padrão forte para o núcleo da maioria das
  aplicações: lidam muito bem com dados estruturados, relações, consultas complexas e
  transações. Bancos NoSQL não são um "upgrade" — são ferramentas especializadas que brilham
  em contextos específicos: chave-valor para cache, sessões e rate limits; document stores
  para dados flexíveis em forma de JSON; wide-column como o Cassandra para escritas
  distribuídas massivas; bancos de grafos quando o relacionamento é a consulta; motores de
  busca como o Elasticsearch para busca textual; bancos vetoriais para similaridade em IA.
  Sistemas reais costumam combinar vários deles — um núcleo relacional mais stores
  especializados — e designs multi-região escolhem, por tipo de dado, entre escritas
  regionais rápidas com sincronização eventual e escritas mais lentas com consistência
  global forte.
glossary:
  - term: Banco relacional (SQL)
    definition: "Armazena dados em tabelas com esquema fixo, relacionadas por chaves, consultadas com SQL e protegidas por transações ACID. A casa padrão do dado central de um app."
  - term: NoSQL
    definition: "Termo guarda-chuva para bancos não relacionais — chave-valor, documento, wide-column e grafos — cada um especializado numa forma de dado ou padrão de acesso."
  - term: Transação ACID
    definition: "Um grupo de operações que confirma ou desfaz como uma unidade (Atomicidade, Consistência, Isolamento, Durabilidade) — ex.: debitar uma conta e creditar outra."
  - term: Esquema (schema)
    definition: "A estrutura definida do dado. SQL a garante no banco (schema-on-write); a maioria dos NoSQL deixa a forma por conta da aplicação."
  - term: Chave-valor (key-value)
    definition: "Um dicionário gigante: busca um valor pela chave exata em microssegundos. Ideal para cache, sessões, feature flags, rate limits e chaves de idempotência."
  - term: Document store
    definition: "Armazena documentos autocontidos tipo JSON, cada um podendo ter a própria forma. Bom para dados flexíveis e em evolução, lidos uma entidade por vez."
  - term: Wide-column store
    definition: "Distribui linhas num cluster por chave de partição, modelando o dado em torno das consultas. Feito para volume massivo de escrita com padrões conhecidos (ex.: Cassandra)."
  - term: Banco de grafos
    definition: "Armazena nós e arestas e consulta atravessando conexões — amigos de amigos, redes de fraude — onde joins seriam brutais."
  - term: Motor de busca
    definition: "Um store de índice invertido (ex.: Elasticsearch) para busca textual: tolerante a erros, ranqueada, facetada. Um índice secundário alimentado pela fonte da verdade."
  - term: Banco vetorial
    definition: "Armazena embeddings e responde consultas de vizinhos mais próximos aproximados — 'encontre os itens mais parecidos com este' — o armazenamento por trás da busca por similaridade em IA."
  - term: Teorema CAP
    definition: "Numa partição de rede, um sistema distribuído precisa escolher entre consistência (todos veem o mesmo dado) e disponibilidade (todos recebem resposta)."
  - term: Consistência eventual
    definition: "Escritas confirmam localmente e replicam em segundo plano; réplicas podem discordar por instantes, mas convergem. Barato e rápido quando a discordância temporária é aceitável."
  - term: Consistência forte
    definition: "Toda leitura vê a última escrita, o que exige coordenação entre réplicas — pago em latência de escrita, principalmente entre regiões."
  - term: Persistência poliglota
    definition: "Usar vários bancos numa mesma aplicação, cada um escolhido para o problema que atende — um núcleo relacional mais stores especializados."
references:
  - label: "Martin Fowler — Polyglot Persistence"
    url: https://martinfowler.com/bliki/PolyglotPersistence.html
  - label: "Designing Data-Intensive Applications (Kleppmann)"
    url: https://dataintensive.net/
  - label: "MongoDB — NoSQL explicado"
    url: https://www.mongodb.com/nosql-explained
  - label: "Apache Cassandra — documentação"
    url: https://cassandra.apache.org/doc/latest/
  - label: "Elastic — O que é o Elasticsearch?"
    url: https://www.elastic.co/what-is/elasticsearch
  - label: "pgvector — vetores no Postgres"
    url: https://github.com/pgvector/pgvector
---

> Use o laboratório de decisão acima para **escolher um banco a partir dos requisitos**:
> responda às perguntas e veja o mapa de candidatos estreitar. Alterne a comparação SQL vs
> NoSQL, percorra as oito famílias de bancos, roteie as features de um app para os stores que
> servem a cada uma e sinta o trade-off eventual-vs-forte entre duas regiões. As notas abaixo
> são a referência rápida.

## O que é

"Qual banco de dados eu devo usar?" tem uma única resposta honesta: **depende do contexto**.
Não existe o melhor banco — existem bancos que se encaixam numa carga de trabalho e bancos
que lutam contra ela. A habilidade que esta aula ensina não é decorar produtos; é **raciocinar
dos requisitos até uma escolha de armazenamento**.

## Os fatores de decisão

Toda decisão de banco pesa as mesmas dimensões:

- **Tipo e forma do dado** — linhas estruturadas com relações? JSON de forma livre? Texto
  para buscar? Embeddings? Um grafo de conexões?
- **Padrão de leitura/escrita** — mais leitura ou mais escrita? Lookups pontuais por chave ou
  consultas ricas? Caminhos de acesso conhecidos ou perguntas ad-hoc?
- **Orçamento de latência** — microssegundos (cache), milissegundos (caminho da requisição)
  ou segundos (analytics)?
- **Necessidade de consistência** — todo leitor precisa ver a última escrita, ou réplicas
  podem discordar por instantes?
- **Trade-offs de CAP** — quando a rede particiona, este dado precisa primeiro de
  consistência ou de disponibilidade?
- **Arquitetura regional** — uma região, ou usuários escrevendo de vários continentes?
- **Expectativa de escala** — um nó bem ajustado dá conta (geralmente sim), ou é de verdade
  um problema de escritas distribuídas?

## SQL — o padrão forte

Para o **dado central da maioria das aplicações** — usuários, pedidos, pagamentos, estoque —
um banco relacional é o padrão por bons motivos:

- **Dados estruturados com relações** — chaves estrangeiras, joins e constraints modelam
  isso diretamente.
- **Consultas complexas** — uma linguagem declarativa responde perguntas que você não
  planejou.
- **Consistência** — transações ACID mantêm mudanças multi-linha corretas; dinheiro se move
  atomicamente.
- **Núcleo da lógica de negócio** — onde a correção domina, as garantias do SQL fazem o
  trabalho pesado.

**Dificuldades honestas:** um único nó de escrita eventualmente sente **pressão de escala
vertical**; **escritas distribuídas** são difíceis de encaixar depois; e **consistência forte
multi-região** é cara e complexa. Isso é real — mas chega bem mais tarde do que os mitos
sugerem, e réplicas de leitura, cache e particionamento empurram esses limites ainda mais.

## NoSQL — especializado, não um upgrade

Bancos NoSQL **não** são "a substituição moderna do SQL". São **ferramentas especializadas**
que abrem mão de coisas que o SQL te dá (joins, transações globais, consultas ad-hoc) para
vencer num trabalho específico: esquema flexível, distribuição massiva ou um padrão de acesso
particular.

**Dois mitos para matar** *(toque nos cards de mito acima)*:

- *"Escritas NoSQL são rápidas, escritas SQL são lentas"* — performance de escrita depende de
  **índices, configuração de durabilidade, requisitos de consistência e arquitetura**, não da
  linguagem de consulta.
- *"NoSQL é para escala, SQL não"* — NoSQL facilita a **escala horizontal de escrita**
  *abrindo mão* de joins e transações globais. Isso é uma troca, e SQL num único nó vai muito
  mais longe do que a fama sugere.

## As famílias NoSQL

- **Chave-valor** (Redis, Memcached, DynamoDB) — um dicionário gigante; busca pela chave
  exata em microssegundos. A casa de **cache, sessões, feature flags, rate limits, chaves de
  idempotência**.
- **Documento** (MongoDB, Firestore) — registros autocontidos em forma de JSON, cada um com a
  própria forma. Bom para **dados em evolução, catálogos, configurações/preferências do
  usuário**.
- **Wide-column** (Cassandra, ScyllaDB) — linhas particionadas num cluster, modeladas em
  torno das consultas. Feito para **volume massivo e distribuído de escrita** com padrões
  conhecidos.
- **Grafo** (Neo4j, Neptune) — nós e arestas; use quando **a travessia é a consulta**
  (amigos de amigos, redes de fraude), não só porque o dado "tem relações".

## Stores especializados

Sistemas em crescimento criam **armazenamento sob medida** ao redor do núcleo:

- **Busca — Elasticsearch/OpenSearch**: índices invertidos dão busca tolerante a erros,
  ranqueada e facetada — algo em que um banco primário é genuinamente ruim.
- **Analytics — ClickHouse/BigQuery/stores de eventos estilo Cassandra**: varreduras
  colunares sobre bilhões de linhas para dashboards e métricas; mantenha-os **fora do caminho
  da requisição**.
- **Séries temporais — TimescaleDB/InfluxDB**: métricas e dados de sensores, comprimidos e
  consultados por janelas de tempo.
- **Vetorial — Pinecone/Qdrant/pgvector**: busca de vizinhos mais próximos sobre embeddings
  para busca semântica, recomendações e RAG em sistemas de IA.

Um modelo mental chave: stores de busca, analytics e vetoriais são **visões secundárias
alimentadas pela fonte da verdade** — podem ser reconstruídos a partir do banco central,
nunca o contrário.

## Um app, vários bancos

Produtos reais praticam **persistência poliglota** *(dispare as features na demo acima)*:

- **PostgreSQL** — o núcleo transacional: pedidos, usuários, pagamentos.
- **Redis** — sessões, rate limits, cache quente: lookups por chave em toda requisição.
- **Elasticsearch** — busca de produtos: ranqueada, tolerante a erros.
- **Store vetorial** — "produtos parecidos": similaridade sobre embeddings.

Cada store faz o trabalho em que é melhor — mas **cada banco extra é custo operacional real**
(deploys, backups, monitoramento, pipelines de sincronização, mais uma coisa que te acorda de
madrugada). Adicione um store quando um problema exigir, **não antes**. Começar com "Postgres
para tudo, Redis para o caminho quente" é uma arquitetura perfeitamente respeitável.

## Trade-offs multi-região — o exemplo dos likes

Um app social tem usuários na Europa e nos EUA, e os dois lados martelam o botão de **like**
*(experimente o laboratório acima)*:

- **Consistência eventual** — cada like confirma na **região local** (~10 ms) e replica em
  segundo plano. Por um instante, as duas regiões discordam da contagem — e, para likes,
  **ninguém liga**. Rápido, barato, disponível.
- **Consistência forte** — todo like coordena através do oceano antes de confirmar
  (~180 ms). Os contadores nunca discordam — e todo usuário paga a viagem de ida e volta em
  cada like.

A lição generaliza: **escolha a consistência por tipo de dado, não por aplicação**. Contagens
de likes, visualizações e presença toleram sincronização eventual. Saldos, estoque e
pagamentos geralmente não — ali você paga pela coordenação. Sincronização mais forte sempre
tem custo: **coordenação entre regiões aumenta latência e complexidade**.

## Trade-offs

- **Simplicidade vs especialização** — um banco é fácil de operar; cinco stores sob medida
  servem melhor cada carga e te acordam de cinco jeitos.
- **Consistência vs latência** — quanto mais perto de "todos veem o mesmo dado na hora",
  mais coordenação cada escrita paga.
- **Um banco vs poliglota** — comece consolidado; separe quando uma carga comprovadamente
  superar o núcleo.
- **Esquema flexível vs esquema garantido** — flexibilidade move a disciplina do banco para
  o código da aplicação.
- **Modelagem por consulta vs por entidade** — a velocidade do wide-column vem de desenhar em
  torno de consultas conhecidas; você abre mão de perguntas ad-hoc.

## Relevância em entrevistas

- **Raciocine dos requisitos, em voz alta** — "o dado é relacional e consistência importa,
  então começo com Postgres" vale mais que citar produtos exóticos. O caminho *é* a resposta.
- **Comece com SQL no núcleo** — depois justifique cada store especializado com um problema
  concreto: "busca é full-text → Elasticsearch; sessões são lookups por chave → Redis".
- **Conheça as famílias, uma linha cada** — chave-valor, documento, wide-column, grafo,
  busca, vetorial, analytics — e um nome de produto por família.
- **Conversa de consistência** — diga *qual dado* precisa de consistência forte e qual tolera
  eventual; conecte escritas multi-região ao trade-off de CAP e ao custo de latência.
- **Mostre contenção** — "eu só adicionaria Cassandra se o volume de escrita exigisse de
  fato" sinaliza senioridade; sacar cinco bancos no primeiro dia sinaliza o oposto.

## Notas de aula

- Resposta padrão: **Postgres no núcleo, Redis para sessões/cache/rate limits**, adicione
  **Elasticsearch** quando a busca aparecer e um **store vetorial** quando similaridade de IA
  aparecer.
- Mate o mito na sala: **SQL escala mais do que imaginam**; NoSQL é uma troca, não um
  upgrade.
- O exemplo dos likes é o atalho multi-região: **escritas regionais + sincronização
  eventual** para dados tolerantes, **coordenação** só onde a correção exige.
- Todo store extra deve ser **alimentado pela fonte da verdade** e precisa pagar seu custo
  operacional.
