import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the Database lesson. Same convention as the other
 * topics: long-form prose lives in the Markdown file; the strings that drive
 * the decision map, the SQL vs NoSQL playground, the type explorer, the
 * polyglot architecture, and the multi-region lab live here — typed &
 * bilingual.
 */

export type DbTypeId =
  | 'sql'
  | 'kv'
  | 'document'
  | 'widecolumn'
  | 'graph'
  | 'search'
  | 'vector'
  | 'analytics';

export type DecisionOutcome = {
  /** Recommend this type and finish. */
  result?: DbTypeId;
  /** Dim these candidates on the map. */
  eliminate?: DbTypeId[];
  /** Continue to this question id. */
  next?: string;
};

export type DecisionQuestion = {
  id: string;
  text: string;
  hint: string;
  yesLabel: string;
  noLabel: string;
  yes: DecisionOutcome;
  no: DecisionOutcome;
};

export type DbTypeMeta = {
  id: DbTypeId;
  label: string;
  tagline: string;
  model: string;
  greatFor: string[];
  watchOut: string;
  products: string;
};

export type PolyglotStore = {
  id: 'core' | 'kv' | 'search' | 'vector';
  label: string;
  tech: string;
  role: string;
};

export type PolyglotAction = {
  id: string;
  label: string;
  store: PolyglotStore['id'];
  note: string;
};

export type MythCard = {
  myth: string;
  reality: string;
};

export type DatabaseContent = {
  shared: {
    reset: string;
    sqlShort: string;
    nosqlShort: string;
  };

  decision: {
    title: string;
    subtitle: string;
    startOver: string;
    yourPath: string;
    candidatesLabel: string;
    recommendedLabel: string;
    caveatLabel: string;
    questions: DecisionQuestion[];
    firstQuestion: string;
    results: Record<DbTypeId, { why: string; caveat: string }>;
    note: string;
  };

  compare: {
    title: string;
    subtitle: string;
    facets: {
      schema: { label: string; sql: string; nosql: string };
      query: { label: string; sql: string; sqlSnippet: string; nosql: string; nosqlSnippet: string };
      consistency: { label: string; sql: string; nosql: string };
      workloads: { label: string; sql: string; nosql: string };
    };
    sqlSchemaCols: string[];
    mythsTitle: string;
    mythsHint: string;
    mythLabel: string;
    realityLabel: string;
    myths: MythCard[];
    note: string;
  };

  explorer: {
    title: string;
    subtitle: string;
    tapHint: string;
    modelLabel: string;
    greatForLabel: string;
    watchOutLabel: string;
    productsLabel: string;
    types: DbTypeMeta[];
  };

  polyglot: {
    title: string;
    subtitle: string;
    app: string;
    tapHint: string;
    stores: PolyglotStore[];
    actions: PolyglotAction[];
    note: string;
  };

  multiRegion: {
    title: string;
    subtitle: string;
    modeLabel: string;
    eventual: string;
    strong: string;
    regionA: string;
    regionB: string;
    likeFrom: string;
    likesLabel: string;
    writeLatency: string;
    syncing: string;
    coordinating: string;
    divergedNote: string;
    convergedNote: string;
    eventualNote: string;
    strongNote: string;
    note: string;
  };
};

const en: DatabaseContent = {
  shared: {
    reset: 'Reset',
    sqlShort: 'SQL',
    nosqlShort: 'NoSQL',
  },

  decision: {
    title: 'The decision lab — pick a database from requirements',
    subtitle:
      'Answer the questions the way you would qualify a real feature. Watch the candidate map narrow with every answer until one storage choice lights up.',
    startOver: 'Start over',
    yourPath: 'Your path',
    candidatesLabel: 'Candidate map',
    recommendedLabel: 'Likely fit',
    caveatLabel: 'But remember',
    firstQuestion: 'kv',
    questions: [
      {
        id: 'kv',
        text: 'Is this a lookup-by-key job — cache, session, rate limit, feature flag, idempotency key?',
        hint: 'You always know the exact key; you never query by content.',
        yesLabel: 'Yes, key lookups',
        noLabel: 'No, richer queries',
        yes: { result: 'kv' },
        no: { eliminate: ['kv'], next: 'search' },
      },
      {
        id: 'search',
        text: 'Is full-text search the main problem — typo-tolerant, ranked, filtered text queries?',
        hint: 'Think product search, log search, "find documents mentioning…".',
        yesLabel: 'Yes, search first',
        noLabel: 'No',
        yes: { result: 'search' },
        no: { eliminate: ['search'], next: 'vector' },
      },
      {
        id: 'vector',
        text: 'Is the goal similarity over embeddings — "find things like this one" for an AI feature?',
        hint: 'Semantic search, recommendations, RAG over documents.',
        yesLabel: 'Yes, similarity',
        noLabel: 'No',
        yes: { result: 'vector' },
        no: { eliminate: ['vector'], next: 'graph' },
      },
      {
        id: 'graph',
        text: 'Are relationships the heart of the queries — friends-of-friends, shortest path, fraud rings?',
        hint: 'Not "has relations" (most data does) — the traversal IS the query.',
        yesLabel: 'Yes, traversals',
        noLabel: 'No',
        yes: { result: 'graph' },
        no: { eliminate: ['graph'], next: 'analytics' },
      },
      {
        id: 'analytics',
        text: 'Is this large-scale analytics or event history — billions of rows, aggregations, time series?',
        hint: 'Dashboards, metrics, event streams — not the app\'s working data.',
        yesLabel: 'Yes, analytics',
        noLabel: 'No, app data',
        yes: { result: 'analytics' },
        no: { eliminate: ['analytics'], next: 'structured' },
      },
      {
        id: 'structured',
        text: 'Is the data structured, with relations between entities and cross-entity consistency needs?',
        hint: 'Orders reference users and products; totals must add up.',
        yesLabel: 'Yes, relational',
        noLabel: 'No, flexible shape',
        yes: { result: 'sql' },
        no: { eliminate: ['sql'], next: 'scale' },
      },
      {
        id: 'scale',
        text: 'Is it a huge, distributed write volume with simple, known access patterns?',
        hint: 'Millions of writes/s across regions, always read the same way.',
        yesLabel: 'Yes, massive writes',
        noLabel: 'No, moderate',
        yes: { result: 'widecolumn' },
        no: { result: 'document' },
      },
    ],
    results: {
      sql: {
        why: 'Structured data, relations, and consistency needs are exactly what relational databases are built for — joins, transactions, and constraints in one engine.',
        caveat: 'SQL scales further than its reputation suggests; revisit only when a real, measured limit appears.',
      },
      kv: {
        why: 'You always know the key and need the value in microseconds-to-milliseconds. A key-value store (like Redis) does exactly this, at very high throughput.',
        caveat: 'It is a lookup engine, not a query engine — the moment you need to search by content, this is the wrong tool.',
      },
      document: {
        why: 'Flexible, evolving, JSON-shaped data with document-at-a-time access fits a document store naturally — no migrations for every new field.',
        caveat: 'A relational database with a JSON column often covers this too; flexible schema shifts the discipline into your application code.',
      },
      widecolumn: {
        why: 'Wide-column stores like Cassandra are built for massive, distributed write volume with predictable, query-first data modeling.',
        caveat: 'You must know your access patterns up front — ad-hoc queries and transactions are not the deal here.',
      },
      graph: {
        why: 'When the traversal is the query — friends-of-friends, fraud rings, dependency chains — a graph database answers in milliseconds what would be brutal recursive joins.',
        caveat: 'If you only occasionally join two tables, SQL handles it fine; graph databases earn their keep on deep, frequent traversals.',
      },
      search: {
        why: 'Inverted indexes give you typo tolerance, ranking, and faceted filters — things a primary database is genuinely bad at.',
        caveat: 'A search engine is an index, not the source of truth — it is fed from your primary database and can be rebuilt from it.',
      },
      vector: {
        why: 'Similarity over embeddings needs approximate nearest-neighbor indexes — the core competence of a vector database.',
        caveat: 'Many databases (Postgres with pgvector, Elasticsearch) now bolt this on well — a separate vector store is for serious scale.',
      },
      analytics: {
        why: 'Columnar/analytics engines scan billions of rows for aggregations that would crush a row-oriented transactional database.',
        caveat: 'Keep it out of the request path — analytics stores are for questions about the data, not for serving the app.',
      },
    },
    note: 'The point is the reasoning, not the answer: requirements → candidates → choice. In an interview, walking this path out loud is the answer.',
  },

  compare: {
    title: 'SQL vs NoSQL — the honest comparison',
    subtitle:
      'Flip between the two worlds and compare schema shape, query model, consistency profile, and typical workloads. Then bust the myths below.',
    facets: {
      schema: {
        label: 'Schema shape',
        sql: 'Tables with a schema defined up front. Every row has the same columns; changes are explicit migrations. The database enforces the shape.',
        nosql: 'Flexible, per-record shape — documents can gain fields freely. The application enforces (or forgets) the shape.',
      },
      query: {
        label: 'Query model',
        sql: 'One declarative language for everything: filters, joins, aggregations, ad-hoc questions you didn\'t plan for.',
        sqlSnippet: 'SELECT u.name, SUM(o.total)\nFROM orders o JOIN users u ON …\nGROUP BY u.name;',
        nosql: 'Access by key or by pre-planned query paths. Blazing fast on the patterns you designed for — awkward outside them.',
        nosqlSnippet: 'db.orders.find({ userId: 42 })\n// or: GET session:9f2a…',
      },
      consistency: {
        label: 'Consistency profile',
        sql: 'ACID transactions as the default: multi-row updates commit or roll back together; constraints hold at all times.',
        nosql: 'Tunable, often eventual by default in distributed stores. Single-document atomicity is common; cross-record transactions are limited or costly.',
      },
      workloads: {
        label: 'Typical home turf',
        sql: 'The transactional core: users, orders, payments, inventory — anywhere correctness and relations dominate.',
        nosql: 'High-scale or specialized paths: sessions, catalogs with wild shapes, event firehoses, search, similarity.',
      },
    },
    sqlSchemaCols: ['id', 'user_id', 'total', 'status'],
    mythsTitle: 'Myth busting',
    mythsHint: 'Tap a card to reveal the reality',
    mythLabel: 'Myth',
    realityLabel: 'Reality',
    myths: [
      {
        myth: '"NoSQL writes are fast, SQL writes are slow."',
        reality:
          'Write speed depends on indexing, durability settings, consistency requirements, and hardware — not the query language. A well-tuned Postgres outruns a badly modeled NoSQL cluster.',
      },
      {
        myth: '"SQL doesn\'t scale."',
        reality:
          'Single SQL nodes handle enormous loads, and read replicas + partitioning stretch them much further. NoSQL makes horizontal write scaling easier by trading away joins and global transactions — that\'s a trade, not a free upgrade.',
      },
      {
        myth: '"NoSQL is the modern upgrade to SQL."',
        reality:
          'They solve different problems. NoSQL shines in specific contexts — flexible shape, massive distribution, special access patterns. For the consistent, relational core of an app, SQL remains the strong default.',
      },
    ],
    note: 'Neither side is "better" — each buys something by giving something up. Name what your workload needs, and the choice usually names itself.',
  },

  explorer: {
    title: 'The database family tree',
    subtitle:
      'Tap a family to see its data model, where it shines, where it bites, and the products you\'d name in an interview.',
    tapHint: 'Tap a family to inspect it',
    modelLabel: 'Data model',
    greatForLabel: 'Great for',
    watchOutLabel: 'Watch out',
    productsLabel: 'Names to know',
    types: [
      {
        id: 'sql',
        label: 'Relational (SQL)',
        tagline: 'Tables, joins, transactions',
        model: 'Rows in tables with a fixed schema, related by foreign keys. Queried with SQL, protected by ACID transactions and constraints.',
        greatFor: [
          'The transactional core: users, orders, payments',
          'Complex, ad-hoc queries and reporting',
          'Data where correctness and relations dominate',
        ],
        watchOut: 'Distributed writes and multi-region strong consistency get expensive and complex.',
        products: 'PostgreSQL, MySQL, SQL Server',
      },
      {
        id: 'kv',
        label: 'Key-value',
        tagline: 'One key, one value, microseconds',
        model: 'A giant dictionary: values fetched by exact key, usually held in memory. No queries by content, no relations.',
        greatFor: [
          'Cache and sessions',
          'Rate limits, feature flags, idempotency keys',
          'Anything hot, small, and fetched by key',
        ],
        watchOut: 'The moment you need to find records by their content, you\'ve outgrown it.',
        products: 'Redis, Memcached, DynamoDB (KV mode)',
      },
      {
        id: 'document',
        label: 'Document',
        tagline: 'Flexible JSON-shaped records',
        model: 'Self-contained JSON-like documents, indexed and queried by their fields. Each document can have its own shape.',
        greatFor: [
          'Evolving or heterogeneous data (catalogs, profiles)',
          'User settings and JSON-like preferences',
          'Reading a whole entity in one fetch',
        ],
        watchOut: 'Schema discipline moves into your code; cross-document transactions are limited.',
        products: 'MongoDB, CouchDB, Firestore',
      },
      {
        id: 'widecolumn',
        label: 'Wide-column',
        tagline: 'Massive distributed writes',
        model: 'Rows grouped by partition key across a cluster; data is modeled around the queries, not the entities.',
        greatFor: [
          'Huge write throughput across regions',
          'Event feeds, messages, sensor/time-series data',
          'Known, repetitive access patterns at scale',
        ],
        watchOut: 'Access patterns must be designed up front — ad-hoc queries and joins are off the menu.',
        products: 'Cassandra, ScyllaDB, HBase',
      },
      {
        id: 'graph',
        label: 'Graph',
        tagline: 'Relationships as first-class data',
        model: 'Nodes and edges with properties; queries traverse connections directly instead of joining tables.',
        greatFor: [
          'Social graphs, friends-of-friends',
          'Fraud detection across linked accounts',
          'Recommendations and dependency chains',
        ],
        watchOut: 'Niche operational expertise; overkill when relations are shallow or occasional.',
        products: 'Neo4j, Neptune, ArangoDB',
      },
      {
        id: 'search',
        label: 'Search engine',
        tagline: 'Full-text, ranked, typo-tolerant',
        model: 'Inverted indexes over text: every term points to the documents containing it, with relevance scoring on top.',
        greatFor: [
          'Product and content search',
          'Log exploration and observability',
          'Faceted filtering ("brand: X, price < 50")',
        ],
        watchOut: 'It\'s a secondary index fed by your source of truth — not the system of record.',
        products: 'Elasticsearch, OpenSearch, Meilisearch',
      },
      {
        id: 'vector',
        label: 'Vector',
        tagline: 'Similarity over embeddings',
        model: 'Stores embedding vectors and finds approximate nearest neighbors — "the items most similar to this one".',
        greatFor: [
          'Semantic search and RAG for AI features',
          '"More like this" recommendations',
          'Image/audio similarity',
        ],
        watchOut: 'Approximate by design; small scales are often served by pgvector inside Postgres.',
        products: 'Pinecone, Weaviate, Qdrant, pgvector',
      },
      {
        id: 'analytics',
        label: 'Analytics / columnar',
        tagline: 'Billions of rows, one question',
        model: 'Column-oriented storage that scans and aggregates huge datasets fast — built for questions about the data, not record lookups.',
        greatFor: [
          'Dashboards and business metrics',
          'Event analytics over billions of rows',
          'Time-series monitoring at scale',
        ],
        watchOut: 'Not for the request path — slow point lookups, batch-oriented ingestion.',
        products: 'ClickHouse, BigQuery, Snowflake, TimescaleDB',
      },
    ],
  },

  polyglot: {
    title: 'One app, several databases — polyglot persistence',
    subtitle:
      'A real product rarely lives in one store. Fire each feature and watch it hit the database that fits its job.',
    app: 'Application',
    tapHint: 'Tap a feature to route it',
    stores: [
      { id: 'core', label: 'Relational core', tech: 'PostgreSQL', role: 'Orders, users, payments — the consistent source of truth.' },
      { id: 'kv', label: 'Key-value', tech: 'Redis', role: 'Sessions, rate limits, hot cache — microsecond lookups by key.' },
      { id: 'search', label: 'Search engine', tech: 'Elasticsearch', role: 'Product search — typo-tolerant, ranked, faceted.' },
      { id: 'vector', label: 'Vector store', tech: 'pgvector / Pinecone', role: '"Similar products" — nearest neighbors over embeddings.' },
    ],
    actions: [
      {
        id: 'checkout',
        label: 'Place an order',
        store: 'core',
        note: 'Money moves: this needs a transaction across orders, stock, and payments — the relational core, nothing else.',
      },
      {
        id: 'session',
        label: 'Check login session',
        store: 'kv',
        note: 'A pure key lookup on every single request — Redis answers in microseconds and keeps this load off the core database.',
      },
      {
        id: 'search',
        label: 'Search "running shoes"',
        store: 'search',
        note: 'Typo-tolerant, ranked full-text search — the search index handles it; the core database would grind on LIKE queries.',
      },
      {
        id: 'similar',
        label: 'Show similar products',
        store: 'vector',
        note: 'Embedding similarity — the vector store finds nearest neighbors; no SQL query expresses "looks like this".',
      },
    ],
    note: 'Each store is fed from the core (search and vector indexes are rebuilt from it, not the other way around). Every extra database is real operational cost — add one when a problem demands it, not before.',
  },

  multiRegion: {
    title: 'Multi-region lab — likes across the ocean',
    subtitle:
      'Two regions, one likes counter. Compare eventual and strong consistency: tap Like on either side and watch where the write commits and what it costs.',
    modeLabel: 'Consistency',
    eventual: 'Eventual',
    strong: 'Strong',
    regionA: 'EU region',
    regionB: 'US region',
    likeFrom: 'Like',
    likesLabel: 'likes',
    writeLatency: 'write latency',
    syncing: 'replicating…',
    coordinating: 'coordinating…',
    divergedNote: 'Counters temporarily disagree — replication is in flight.',
    convergedNote: 'Counters converged.',
    eventualNote:
      'The write commits in the local region (~10 ms) and replicates in the background. For a moment the two regions disagree on the count — and for likes, nobody cares.',
    strongNote:
      'Every write coordinates across the ocean before committing (~180 ms). The counters never disagree — and every user pays the round trip on every like.',
    note: 'This is the real CAP conversation: likes tolerate temporary disagreement, so regional writes + eventual sync win. A payment balance doesn\'t — there you pay for coordination. Choose per data type, not per app.',
  },
};

const ptBR: DatabaseContent = {
  shared: {
    reset: 'Reiniciar',
    sqlShort: 'SQL',
    nosqlShort: 'NoSQL',
  },

  decision: {
    title: 'O laboratório de decisão — escolha um banco a partir dos requisitos',
    subtitle:
      'Responda às perguntas como você qualificaria uma feature real. Veja o mapa de candidatos estreitar a cada resposta até uma escolha de armazenamento acender.',
    startOver: 'Recomeçar',
    yourPath: 'Seu caminho',
    candidatesLabel: 'Mapa de candidatos',
    recommendedLabel: 'Provável escolha',
    caveatLabel: 'Mas lembre',
    firstQuestion: 'kv',
    questions: [
      {
        id: 'kv',
        text: 'É um trabalho de busca por chave — cache, sessão, rate limit, feature flag, chave de idempotência?',
        hint: 'Você sempre sabe a chave exata; nunca consulta pelo conteúdo.',
        yesLabel: 'Sim, busca por chave',
        noLabel: 'Não, consultas mais ricas',
        yes: { result: 'kv' },
        no: { eliminate: ['kv'], next: 'search' },
      },
      {
        id: 'search',
        text: 'Busca textual é o problema principal — consultas com tolerância a erros, ranqueadas e filtradas?',
        hint: 'Pense em busca de produtos, busca em logs, "encontre documentos que mencionam…".',
        yesLabel: 'Sim, busca primeiro',
        noLabel: 'Não',
        yes: { result: 'search' },
        no: { eliminate: ['search'], next: 'vector' },
      },
      {
        id: 'vector',
        text: 'O objetivo é similaridade sobre embeddings — "encontre coisas parecidas com esta" para uma feature de IA?',
        hint: 'Busca semântica, recomendações, RAG sobre documentos.',
        yesLabel: 'Sim, similaridade',
        noLabel: 'Não',
        yes: { result: 'vector' },
        no: { eliminate: ['vector'], next: 'graph' },
      },
      {
        id: 'graph',
        text: 'Os relacionamentos são o coração das consultas — amigos de amigos, caminho mais curto, redes de fraude?',
        hint: 'Não "tem relações" (quase todo dado tem) — a travessia É a consulta.',
        yesLabel: 'Sim, travessias',
        noLabel: 'Não',
        yes: { result: 'graph' },
        no: { eliminate: ['graph'], next: 'analytics' },
      },
      {
        id: 'analytics',
        text: 'É analytics em larga escala ou histórico de eventos — bilhões de linhas, agregações, séries temporais?',
        hint: 'Dashboards, métricas, fluxos de eventos — não o dado de trabalho do app.',
        yesLabel: 'Sim, analytics',
        noLabel: 'Não, dado do app',
        yes: { result: 'analytics' },
        no: { eliminate: ['analytics'], next: 'structured' },
      },
      {
        id: 'structured',
        text: 'O dado é estruturado, com relações entre entidades e necessidade de consistência entre elas?',
        hint: 'Pedidos referenciam usuários e produtos; os totais precisam fechar.',
        yesLabel: 'Sim, relacional',
        noLabel: 'Não, forma flexível',
        yes: { result: 'sql' },
        no: { eliminate: ['sql'], next: 'scale' },
      },
      {
        id: 'scale',
        text: 'É um volume de escrita enorme e distribuído, com padrões de acesso simples e conhecidos?',
        hint: 'Milhões de escritas/s entre regiões, sempre lidas do mesmo jeito.',
        yesLabel: 'Sim, escritas massivas',
        noLabel: 'Não, moderado',
        yes: { result: 'widecolumn' },
        no: { result: 'document' },
      },
    ],
    results: {
      sql: {
        why: 'Dados estruturados, relações e necessidade de consistência são exatamente para o que bancos relacionais foram feitos — joins, transações e constraints num único motor.',
        caveat: 'SQL escala mais do que a fama sugere; revisite a escolha só quando um limite real e medido aparecer.',
      },
      kv: {
        why: 'Você sempre sabe a chave e precisa do valor em microssegundos a milissegundos. Um key-value store (como o Redis) faz exatamente isso, com altíssimo throughput.',
        caveat: 'É um motor de lookup, não de consulta — no momento em que precisar buscar por conteúdo, é a ferramenta errada.',
      },
      document: {
        why: 'Dados flexíveis, em evolução, com forma de JSON e acesso documento a documento cabem naturalmente num document store — sem migração a cada campo novo.',
        caveat: 'Um banco relacional com coluna JSON muitas vezes cobre isso também; esquema flexível transfere a disciplina para o código da aplicação.',
      },
      widecolumn: {
        why: 'Wide-column stores como o Cassandra são feitos para volume massivo e distribuído de escrita, com modelagem orientada às consultas.',
        caveat: 'Você precisa conhecer os padrões de acesso de antemão — consultas ad-hoc e transações não fazem parte do acordo.',
      },
      graph: {
        why: 'Quando a travessia é a consulta — amigos de amigos, redes de fraude, cadeias de dependência — um banco de grafos responde em milissegundos o que seriam joins recursivos brutais.',
        caveat: 'Se você só junta duas tabelas de vez em quando, SQL resolve bem; bancos de grafos se pagam em travessias profundas e frequentes.',
      },
      search: {
        why: 'Índices invertidos dão tolerância a erros de digitação, ranqueamento e filtros facetados — coisas em que um banco primário é genuinamente ruim.',
        caveat: 'Um motor de busca é um índice, não a fonte da verdade — ele é alimentado pelo seu banco primário e pode ser reconstruído a partir dele.',
      },
      vector: {
        why: 'Similaridade sobre embeddings exige índices de vizinhos mais próximos aproximados — a competência central de um banco vetorial.',
        caveat: 'Muitos bancos (Postgres com pgvector, Elasticsearch) já fazem isso bem — um vector store separado é para escala séria.',
      },
      analytics: {
        why: 'Motores colunares/analíticos varrem bilhões de linhas para agregações que esmagariam um banco transacional orientado a linhas.',
        caveat: 'Mantenha-o fora do caminho da requisição — stores analíticos respondem perguntas sobre o dado, não servem o app.',
      },
    },
    note: 'O ponto é o raciocínio, não a resposta: requisitos → candidatos → escolha. Numa entrevista, percorrer esse caminho em voz alta é a resposta.',
  },

  compare: {
    title: 'SQL vs NoSQL — a comparação honesta',
    subtitle:
      'Alterne entre os dois mundos e compare forma do esquema, modelo de consulta, perfil de consistência e cargas típicas. Depois derrube os mitos abaixo.',
    facets: {
      schema: {
        label: 'Forma do esquema',
        sql: 'Tabelas com esquema definido de antemão. Toda linha tem as mesmas colunas; mudanças são migrações explícitas. O banco garante a forma.',
        nosql: 'Forma flexível, por registro — documentos ganham campos livremente. A aplicação garante (ou esquece) a forma.',
      },
      query: {
        label: 'Modelo de consulta',
        sql: 'Uma linguagem declarativa para tudo: filtros, joins, agregações, perguntas ad-hoc que você não planejou.',
        sqlSnippet: 'SELECT u.name, SUM(o.total)\nFROM orders o JOIN users u ON …\nGROUP BY u.name;',
        nosql: 'Acesso por chave ou por caminhos de consulta pré-planejados. Voa nos padrões para os quais você desenhou — desajeitado fora deles.',
        nosqlSnippet: 'db.orders.find({ userId: 42 })\n// ou: GET session:9f2a…',
      },
      consistency: {
        label: 'Perfil de consistência',
        sql: 'Transações ACID por padrão: atualizações multi-linha confirmam ou desfazem juntas; constraints valem o tempo todo.',
        nosql: 'Ajustável, muitas vezes eventual por padrão em stores distribuídos. Atomicidade por documento é comum; transações entre registros são limitadas ou caras.',
      },
      workloads: {
        label: 'Território natural',
        sql: 'O núcleo transacional: usuários, pedidos, pagamentos, estoque — onde correção e relações dominam.',
        nosql: 'Caminhos de alta escala ou especializados: sessões, catálogos de formas variadas, enxurradas de eventos, busca, similaridade.',
      },
    },
    sqlSchemaCols: ['id', 'user_id', 'total', 'status'],
    mythsTitle: 'Derrubando mitos',
    mythsHint: 'Toque num card para revelar a realidade',
    mythLabel: 'Mito',
    realityLabel: 'Realidade',
    myths: [
      {
        myth: '"Escritas NoSQL são rápidas, escritas SQL são lentas."',
        reality:
          'Velocidade de escrita depende de índices, configuração de durabilidade, requisitos de consistência e hardware — não da linguagem de consulta. Um Postgres bem ajustado deixa para trás um cluster NoSQL mal modelado.',
      },
      {
        myth: '"SQL não escala."',
        reality:
          'Um único nó SQL aguenta cargas enormes, e réplicas de leitura + particionamento esticam muito mais. NoSQL facilita a escala horizontal de escrita abrindo mão de joins e transações globais — isso é uma troca, não um upgrade grátis.',
      },
      {
        myth: '"NoSQL é a evolução moderna do SQL."',
        reality:
          'Eles resolvem problemas diferentes. NoSQL brilha em contextos específicos — forma flexível, distribuição massiva, padrões de acesso especiais. Para o núcleo consistente e relacional de um app, SQL continua sendo o padrão forte.',
      },
    ],
    note: 'Nenhum lado é "melhor" — cada um compra algo abrindo mão de outra coisa. Nomeie o que a sua carga precisa e a escolha costuma se nomear sozinha.',
  },

  explorer: {
    title: 'A árvore genealógica dos bancos',
    subtitle:
      'Toque numa família para ver o modelo de dados, onde ela brilha, onde ela morde e os produtos que você citaria numa entrevista.',
    tapHint: 'Toque numa família para inspecionar',
    modelLabel: 'Modelo de dados',
    greatForLabel: 'Ótimo para',
    watchOutLabel: 'Atenção',
    productsLabel: 'Nomes para conhecer',
    types: [
      {
        id: 'sql',
        label: 'Relacional (SQL)',
        tagline: 'Tabelas, joins, transações',
        model: 'Linhas em tabelas com esquema fixo, relacionadas por chaves estrangeiras. Consultado com SQL, protegido por transações ACID e constraints.',
        greatFor: [
          'O núcleo transacional: usuários, pedidos, pagamentos',
          'Consultas complexas e ad-hoc, relatórios',
          'Dados onde correção e relações dominam',
        ],
        watchOut: 'Escritas distribuídas e consistência forte multi-região ficam caras e complexas.',
        products: 'PostgreSQL, MySQL, SQL Server',
      },
      {
        id: 'kv',
        label: 'Chave-valor',
        tagline: 'Uma chave, um valor, microssegundos',
        model: 'Um dicionário gigante: valores buscados pela chave exata, geralmente em memória. Sem consultas por conteúdo, sem relações.',
        greatFor: [
          'Cache e sessões',
          'Rate limits, feature flags, chaves de idempotência',
          'Qualquer coisa quente, pequena e buscada por chave',
        ],
        watchOut: 'No momento em que precisar encontrar registros pelo conteúdo, você o superou.',
        products: 'Redis, Memcached, DynamoDB (modo KV)',
      },
      {
        id: 'document',
        label: 'Documento',
        tagline: 'Registros flexíveis em forma de JSON',
        model: 'Documentos autocontidos tipo JSON, indexados e consultados pelos campos. Cada documento pode ter a própria forma.',
        greatFor: [
          'Dados em evolução ou heterogêneos (catálogos, perfis)',
          'Configurações do usuário e preferências tipo JSON',
          'Ler uma entidade inteira numa única busca',
        ],
        watchOut: 'A disciplina de esquema migra para o seu código; transações entre documentos são limitadas.',
        products: 'MongoDB, CouchDB, Firestore',
      },
      {
        id: 'widecolumn',
        label: 'Wide-column',
        tagline: 'Escritas distribuídas massivas',
        model: 'Linhas agrupadas por chave de partição num cluster; o dado é modelado em torno das consultas, não das entidades.',
        greatFor: [
          'Throughput de escrita enorme entre regiões',
          'Feeds de eventos, mensagens, dados de sensores/séries temporais',
          'Padrões de acesso conhecidos e repetitivos em escala',
        ],
        watchOut: 'Os padrões de acesso precisam ser desenhados de antemão — consultas ad-hoc e joins estão fora do cardápio.',
        products: 'Cassandra, ScyllaDB, HBase',
      },
      {
        id: 'graph',
        label: 'Grafo',
        tagline: 'Relacionamentos como dado de primeira classe',
        model: 'Nós e arestas com propriedades; as consultas atravessam conexões diretamente em vez de juntar tabelas.',
        greatFor: [
          'Grafos sociais, amigos de amigos',
          'Detecção de fraude entre contas ligadas',
          'Recomendações e cadeias de dependência',
        ],
        watchOut: 'Expertise operacional de nicho; exagero quando as relações são rasas ou ocasionais.',
        products: 'Neo4j, Neptune, ArangoDB',
      },
      {
        id: 'search',
        label: 'Motor de busca',
        tagline: 'Texto completo, ranqueado, tolerante a erros',
        model: 'Índices invertidos sobre texto: cada termo aponta para os documentos que o contêm, com ranqueamento de relevância por cima.',
        greatFor: [
          'Busca de produtos e conteúdo',
          'Exploração de logs e observabilidade',
          'Filtros facetados ("marca: X, preço < 50")',
        ],
        watchOut: 'É um índice secundário alimentado pela fonte da verdade — não o sistema de registro.',
        products: 'Elasticsearch, OpenSearch, Meilisearch',
      },
      {
        id: 'vector',
        label: 'Vetorial',
        tagline: 'Similaridade sobre embeddings',
        model: 'Armazena vetores de embedding e encontra vizinhos mais próximos aproximados — "os itens mais parecidos com este".',
        greatFor: [
          'Busca semântica e RAG para features de IA',
          'Recomendações "mais como este"',
          'Similaridade de imagem/áudio',
        ],
        watchOut: 'Aproximado por design; escalas pequenas costumam ser servidas pelo pgvector dentro do Postgres.',
        products: 'Pinecone, Weaviate, Qdrant, pgvector',
      },
      {
        id: 'analytics',
        label: 'Analítico / colunar',
        tagline: 'Bilhões de linhas, uma pergunta',
        model: 'Armazenamento orientado a colunas que varre e agrega datasets enormes rápido — feito para perguntas sobre o dado, não para lookups de registros.',
        greatFor: [
          'Dashboards e métricas de negócio',
          'Analytics de eventos sobre bilhões de linhas',
          'Monitoramento de séries temporais em escala',
        ],
        watchOut: 'Não é para o caminho da requisição — lookups pontuais lentos, ingestão orientada a lotes.',
        products: 'ClickHouse, BigQuery, Snowflake, TimescaleDB',
      },
    ],
  },

  polyglot: {
    title: 'Um app, vários bancos — persistência poliglota',
    subtitle:
      'Um produto real raramente vive num único store. Dispare cada feature e veja-a bater no banco que serve para aquele trabalho.',
    app: 'Aplicação',
    tapHint: 'Toque numa feature para roteá-la',
    stores: [
      { id: 'core', label: 'Núcleo relacional', tech: 'PostgreSQL', role: 'Pedidos, usuários, pagamentos — a fonte da verdade consistente.' },
      { id: 'kv', label: 'Chave-valor', tech: 'Redis', role: 'Sessões, rate limits, cache quente — lookups em microssegundos por chave.' },
      { id: 'search', label: 'Motor de busca', tech: 'Elasticsearch', role: 'Busca de produtos — tolerante a erros, ranqueada, facetada.' },
      { id: 'vector', label: 'Store vetorial', tech: 'pgvector / Pinecone', role: '"Produtos parecidos" — vizinhos mais próximos sobre embeddings.' },
    ],
    actions: [
      {
        id: 'checkout',
        label: 'Fechar um pedido',
        store: 'core',
        note: 'Dinheiro em movimento: precisa de uma transação entre pedidos, estoque e pagamentos — o núcleo relacional, nada mais.',
      },
      {
        id: 'session',
        label: 'Checar sessão de login',
        store: 'kv',
        note: 'Um lookup puro por chave em toda requisição — o Redis responde em microssegundos e tira essa carga do banco principal.',
      },
      {
        id: 'search',
        label: 'Buscar "tênis de corrida"',
        store: 'search',
        note: 'Busca textual tolerante a erros e ranqueada — o índice de busca resolve; o banco principal se arrastaria em consultas LIKE.',
      },
      {
        id: 'similar',
        label: 'Mostrar produtos parecidos',
        store: 'vector',
        note: 'Similaridade de embeddings — o store vetorial encontra vizinhos próximos; nenhuma consulta SQL expressa "parece com este".',
      },
    ],
    note: 'Cada store é alimentado a partir do núcleo (índices de busca e vetoriais são reconstruídos dele, nunca o contrário). Cada banco extra é custo operacional real — adicione um quando um problema exigir, não antes.',
  },

  multiRegion: {
    title: 'Laboratório multi-região — likes cruzando o oceano',
    subtitle:
      'Duas regiões, um contador de likes. Compare consistência eventual e forte: toque em Like de cada lado e veja onde a escrita confirma e o que ela custa.',
    modeLabel: 'Consistência',
    eventual: 'Eventual',
    strong: 'Forte',
    regionA: 'Região Europa',
    regionB: 'Região EUA',
    likeFrom: 'Like',
    likesLabel: 'likes',
    writeLatency: 'latência de escrita',
    syncing: 'replicando…',
    coordinating: 'coordenando…',
    divergedNote: 'Os contadores discordam temporariamente — a replicação está em voo.',
    convergedNote: 'Contadores convergiram.',
    eventualNote:
      'A escrita confirma na região local (~10 ms) e replica em segundo plano. Por um instante as duas regiões discordam da contagem — e, para likes, ninguém liga.',
    strongNote:
      'Toda escrita coordena através do oceano antes de confirmar (~180 ms). Os contadores nunca discordam — e todo usuário paga a viagem de ida e volta em cada like.',
    note: 'Essa é a conversa real de CAP: likes toleram discordância temporária, então escritas regionais + sincronização eventual ganham. Um saldo de pagamento não tolera — ali você paga pela coordenação. Escolha por tipo de dado, não por app.',
  },
};

export const databaseContent: Record<Locale, DatabaseContent> = {
  en,
  'pt-BR': ptBR,
};
