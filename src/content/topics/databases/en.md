---
title: "Databases"
slug: databases
description: "How to choose the right database for the context — SQL vs NoSQL honestly, specialized stores, polyglot architectures, and multi-region consistency trade-offs."
category: blocos-fundamentais
order: 90
difficulty: intermediate
status: published
tags: [databases, sql, nosql, cap-theorem, scalability, architecture, storage]
updatedAt: "2026-07-17"
beginnerSummary: >-
  There is no single best database — the right choice depends on the context: the shape of the
  data, the read/write pattern, the latency budget, the consistency needs, and where the users
  are. SQL (relational) databases are the strong default for the core of most applications:
  they handle structured data, relations, complex queries, and transactions extremely well.
  NoSQL databases are not an "upgrade" — they are specialized tools that shine in specific
  contexts: key-value stores for caches, sessions and rate limits; document stores for
  flexible, JSON-shaped data; wide-column stores like Cassandra for massive distributed
  writes; graph databases when relationships are the query; search engines like Elasticsearch
  for full-text search; vector databases for AI similarity. Real systems often combine
  several of these — a relational core plus specialized stores — and multi-region designs
  choose, per data type, between fast regional writes with eventual sync and slower writes
  with strong global consistency.
glossary:
  - term: Relational database (SQL)
    definition: "Stores data in tables with a fixed schema, related by keys, queried with SQL, and protected by ACID transactions. The default home of an app's core data."
  - term: NoSQL
    definition: "An umbrella term for non-relational databases — key-value, document, wide-column, and graph stores — each specialized for a shape of data or access pattern."
  - term: ACID transaction
    definition: "A group of operations that commits or rolls back as one unit (Atomicity, Consistency, Isolation, Durability) — e.g. debit one account and credit another."
  - term: Schema
    definition: "The defined structure of the data. SQL enforces it in the database (schema-on-write); most NoSQL stores leave the shape to the application."
  - term: Key-value store
    definition: "A giant dictionary: fetch a value by its exact key in microseconds. Ideal for caches, sessions, feature flags, rate limits, and idempotency keys."
  - term: Document store
    definition: "Stores self-contained JSON-like documents that can each have their own shape. Good for flexible, evolving data read one entity at a time."
  - term: Wide-column store
    definition: "Distributes rows across a cluster by partition key, modeling data around the queries. Built for massive write volume with known access patterns (e.g. Cassandra)."
  - term: Graph database
    definition: "Stores nodes and edges and queries by traversing connections — friends-of-friends, fraud rings — where joins would be brutal."
  - term: Search engine
    definition: "An inverted-index store (e.g. Elasticsearch) for full-text search: typo-tolerant, ranked, faceted. A secondary index fed from the source of truth."
  - term: Vector database
    definition: "Stores embeddings and answers approximate nearest-neighbor queries — 'find the items most similar to this one' — the storage behind AI similarity search."
  - term: CAP theorem
    definition: "In a network partition, a distributed system must choose between consistency (everyone sees the same data) and availability (everyone gets an answer)."
  - term: Eventual consistency
    definition: "Writes commit locally and replicate in the background; replicas may briefly disagree but converge. Cheap and fast when temporary disagreement is acceptable."
  - term: Strong consistency
    definition: "Every read sees the latest write, which requires coordination between replicas — paid for in write latency, especially across regions."
  - term: Polyglot persistence
    definition: "Using several databases in one application, each chosen for the problem it serves — a relational core plus specialized stores."
references:
  - label: "Martin Fowler — Polyglot Persistence"
    url: https://martinfowler.com/bliki/PolyglotPersistence.html
  - label: "Designing Data-Intensive Applications (Kleppmann)"
    url: https://dataintensive.net/
  - label: "MongoDB — NoSQL explained"
    url: https://www.mongodb.com/nosql-explained
  - label: "Apache Cassandra — documentation"
    url: https://cassandra.apache.org/doc/latest/
  - label: "Elastic — What is Elasticsearch?"
    url: https://www.elastic.co/what-is/elasticsearch
  - label: "pgvector — vectors in Postgres"
    url: https://github.com/pgvector/pgvector
---

> Use the decision lab above to **choose a database from requirements**: answer the questions
> and watch the candidate map narrow. Flip the SQL vs NoSQL comparison, tour the eight
> database families, route one app's features to the stores that fit them, and feel the
> eventual-vs-strong trade-off across two regions. The notes below are the quick reference.

## What it is

"Which database should I use?" has one honest answer: **it depends on the context**. There is
no best database — there are databases that fit a workload and databases that fight it. The
skill this lesson teaches is not memorizing products; it is **reasoning from requirements to
a storage choice**.

## The decision factors

Every database decision weighs the same handful of dimensions:

- **Type and shape of data** — structured rows with relations? Free-form JSON? Text to
  search? Embeddings? A graph of connections?
- **Read/write pattern** — read-heavy or write-heavy? Point lookups by key, or rich queries?
  Known access paths, or ad-hoc questions?
- **Latency budget** — microseconds (cache), milliseconds (request path), or seconds
  (analytics)?
- **Consistency needs** — must every reader see the latest write, or can replicas briefly
  disagree?
- **CAP trade-offs** — when the network partitions, does this data need consistency or
  availability first?
- **Regional architecture** — one region, or users writing from several continents?
- **Scale expectations** — will one well-tuned node do (usually yes), or is this genuinely a
  distributed-writes problem?

## SQL — the strong default

For the **core data of most applications** — users, orders, payments, inventory — a
relational database is the default for good reasons:

- **Structured data with relations** — foreign keys, joins, and constraints model it
  directly.
- **Complex queries** — one declarative language answers questions you didn't plan for.
- **Consistency** — ACID transactions keep multi-row changes correct; money moves atomically.
- **Business logic core** — where correctness dominates, SQL's guarantees do the heavy
  lifting.

**Honest difficulties:** a single writer node eventually feels **vertical scaling pressure**;
**distributed writes** are hard to retrofit; and **multi-region strong consistency** is
expensive and complex. These are real — but they arrive much later than the myths suggest,
and read replicas, caching, and partitioning push them further still.

## NoSQL — specialized, not an upgrade

NoSQL databases are **not** "the modern replacement for SQL". They are **specialized tools**
that trade away things SQL gives you (joins, global transactions, ad-hoc queries) to win at a
specific job: flexible schema, massive distribution, or one particular access pattern.

**Two myths to kill** *(tap the myth cards above)*:

- *"NoSQL writes are fast, SQL writes are slow"* — write performance depends on **indexing,
  durability settings, consistency requirements, and architecture**, not the query language.
- *"NoSQL is for scale, SQL isn't"* — NoSQL makes **horizontal write scaling** easier *by
  giving up* joins and global transactions. That is a trade, and single-node SQL goes much
  further than its reputation.

## The NoSQL families

- **Key-value** (Redis, Memcached, DynamoDB) — a giant dictionary; fetch by exact key in
  microseconds. The home of **caches, sessions, feature flags, rate limits, idempotency
  keys**.
- **Document** (MongoDB, Firestore) — self-contained JSON-shaped records, each with its own
  shape. Good for **evolving data, catalogs, user settings/preferences**.
- **Wide-column** (Cassandra, ScyllaDB) — rows partitioned across a cluster, modeled around
  the queries. Built for **massive, distributed write volume** with known access patterns.
- **Graph** (Neo4j, Neptune) — nodes and edges; use it when **the traversal is the query**
  (friends-of-friends, fraud rings), not merely because the data "has relations".

## Specialized stores

Scaling systems grow **purpose-built storage** around the core:

- **Search — Elasticsearch/OpenSearch**: inverted indexes give typo-tolerant, ranked,
  faceted search that a primary database is genuinely bad at.
- **Analytics — ClickHouse/BigQuery/Cassandra-style event stores**: columnar scans over
  billions of rows for dashboards and metrics; keep them **out of the request path**.
- **Time-series — TimescaleDB/InfluxDB**: metrics and sensor data, compressed and queried by
  time windows.
- **Vector — Pinecone/Qdrant/pgvector**: nearest-neighbor search over embeddings for
  semantic search, recommendations, and RAG in AI systems.

A key mental model: search, analytics, and vector stores are **secondary views fed from the
source of truth** — they can be rebuilt from the core database, never the other way around.

## One app, several databases

Real products practice **polyglot persistence** *(fire the features in the demo above)*:

- **PostgreSQL** — the transactional core: orders, users, payments.
- **Redis** — sessions, rate limits, hot cache: key lookups on every request.
- **Elasticsearch** — product search: ranked, typo-tolerant.
- **Vector store** — "similar products": similarity over embeddings.

Each store does the job it's best at — but **every extra database is real operational cost**
(deploys, backups, monitoring, sync pipelines, one more thing that pages you). Add a store
when a problem demands it, **not before**. Starting with "Postgres for everything, Redis for
the hot path" is a perfectly respectable architecture.

## Multi-region trade-offs — the likes example

A social app has users in Europe and the US, and both are hammering the **like** button
*(try the lab above)*:

- **Eventual consistency** — each like commits in its **local region** (~10 ms) and
  replicates in the background. For a moment, the two regions disagree on the count — and
  for likes, **nobody cares**. Fast, cheap, available.
- **Strong consistency** — every like coordinates across the ocean before committing
  (~180 ms). The counters never disagree — and every user pays the round trip on every
  single like.

The lesson generalizes: **choose consistency per data type, not per application**. Like
counts, view counters, and presence tolerate eventual sync. Account balances, inventory, and
payments usually don't — there you pay for coordination. Stronger synchronization always has
a cost: **coordination across regions increases latency and complexity**.

## Trade-offs

- **Simplicity vs specialization** — one database is easy to operate; five fit-for-purpose
  stores serve each workload better and page you five ways.
- **Consistency vs latency** — the closer to "everyone sees the same data instantly", the
  more coordination every write pays.
- **One DB vs polyglot** — start consolidated; split when a workload measurably outgrows the
  core.
- **Flexible schema vs enforced schema** — flexibility moves the discipline from the
  database into your application code.
- **Query-first modeling vs entity modeling** — wide-column speed comes from designing
  around known queries; you give up ad-hoc questions.

## Interview relevance

- **Reason from requirements, out loud** — "the data is relational and consistency matters,
  so I'll start with Postgres" beats naming exotic products. The path *is* the answer.
- **Default to SQL for the core** — then justify each specialized store with a concrete
  problem: "search is full-text → Elasticsearch; sessions are key lookups → Redis".
- **Know the families, one line each** — key-value, document, wide-column, graph, search,
  vector, analytics — and one product name per family.
- **Consistency talk** — say *which data* needs strong consistency and which tolerates
  eventual; tie multi-region writes to the CAP trade-off and its latency cost.
- **Show restraint** — "I'd add Cassandra only if write volume actually demands it" signals
  seniority; reaching for five databases on day one signals the opposite.

## Class notes

- Default answer: **Postgres for the core, Redis for sessions/cache/rate limits**, add
  **Elasticsearch** when search appears, a **vector store** when AI similarity appears.
- Kill the myth in the room: **SQL scales further than they think**; NoSQL is a trade, not
  an upgrade.
- Likes example is the multi-region cheat code: **regional writes + eventual sync** for
  tolerant data, **coordination** only where correctness demands it.
- Every extra store must be **fed from the source of truth** and must earn its operational
  cost.
