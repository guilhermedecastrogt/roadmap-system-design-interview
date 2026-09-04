---
title: "GraphQL"
slug: graphql
description: "A query language for APIs where the client asks for exactly the fields it needs — the schema, resolvers, the N+1 trap, and the cost budget a flexible endpoint demands."
category: blocos-fundamentais
order: 88
difficulty: intermediate
status: published
tags: [graphql, api, schema, resolvers, overfetching, performance]
updatedAt: "2026-09-03"
beginnerSummary: >-
  With GraphQL the client sends a query describing the shape it wants, and the server answers
  in that shape. Instead of many endpoints that each return a fixed object, there is usually one
  endpoint and a typed schema describing everything that can be asked for. A timeline card that
  needs four fields asks for four fields — and can pull nested data, like each tweet's author,
  in the same round trip. That fixes two REST annoyances: downloading fields you never render
  (overfetching) and making extra calls to complete a screen (underfetching). The cost does not
  disappear, though — it moves to the server. Every field is backed by a resolver function, so
  a naive one triggers a database query per item (the N+1 problem), authorization has to be
  enforced field by field, caching is more work than in REST, and an endpoint that accepts any
  shape needs a budget: depth limits, cost analysis, and capped page sizes.
glossary:
  - term: GraphQL
    definition: "A query language for APIs and a runtime for executing those queries against your data, where the client specifies the fields it wants."
  - term: Schema
    definition: "The typed contract: every type, field and operation the API offers. It is introspectable, so clients and tools can discover it automatically."
  - term: Query
    definition: "A read operation. Safe by convention — the GraphQL equivalent of a GET."
  - term: Mutation
    definition: "A write operation that changes data and returns the new state in the same round trip."
  - term: Subscription
    definition: "A long-lived stream of updates, usually over WebSockets, for live counters and notifications."
  - term: Resolver
    definition: "The function that produces the value of one field. Every field in the schema has one, and its performance is the API's performance."
  - term: Overfetching
    definition: "Downloading fields the screen never renders, because the endpoint returns a fixed shape."
  - term: Underfetching
    definition: "One response is not enough, so the client makes extra calls to complete the screen."
  - term: N+1 problem
    definition: "One query for a list plus one query per item to resolve a nested field. Batching loaders collapse those into a single lookup per request."
  - term: Query depth limiting
    definition: "Rejecting queries nested beyond a fixed number of levels — the cheapest defence against pathological shapes."
  - term: Cost analysis
    definition: "Assigning weights to fields, estimating a query's cost before executing it, and rejecting anything over budget."
  - term: Persisted queries
    definition: "Accepting only queries you shipped, referenced by hash, so arbitrary queries stop being possible in production."
  - term: Introspection
    definition: "The built-in ability to query the schema itself. Great for tooling; commonly disabled in production for non-public APIs."
references:
  - label: "GraphQL — Introduction to GraphQL"
    url: https://graphql.org/learn/
  - label: "GraphQL — Best practices"
    url: https://graphql.org/learn/best-practices/
  - label: "GraphQL — Security and query costs (serving over HTTP)"
    url: https://graphql.org/learn/serving-over-http/
  - label: "Apollo — Rate limiting and demand control"
    url: https://www.apollographql.com/docs/router/executing-operations/demand-control
  - label: "GraphQL Foundation — DataLoader"
    url: https://github.com/graphql/dataloader
---

> Lesson 4 of the API track — the one where the client writes the shape. Build a query field by
> field above and watch the response shrink to match, compare the same screen fetched three
> ways, then push the complexity sliders until the server refuses to run your query.

## What GraphQL is

GraphQL is a **query language for APIs plus a runtime that executes those queries**. The server
publishes a **typed schema** of everything that can be asked for; the client sends a query
naming the fields it wants; the response comes back in that exact shape.

```graphql
query Timeline {
  timeline(first: 10) {
    id
    text
    likeCount
    author { name avatarUrl }
  }
}
```

Four practical consequences:

- **One endpoint is the norm** (`POST /graphql`), so the *shape*, not the URL, selects what you
  get.
- **The client controls the response shape** — no more, no less than it asked for.
- **Nested data comes in the same round trip**, which is what makes rich screens feel quick.
- **The schema is the documentation.** It is introspectable, so editors, clients and tools
  discover it automatically.

## Schema, operations, resolvers

The schema declares types and their fields; three operation types drive them:

- **Query** — read. `query { timeline(first: 10) { id text } }`
- **Mutation** — write, and get the new state back. `mutation { createTweet(text: "hi") { id } }`
- **Subscription** — a live stream of updates, usually over WebSockets.

Behind every field sits a **resolver**: a function the server runs to produce that field's
value. This is the part beginners under-appreciate, because it is where the performance and
security stories live:

- `Query.timeline` fetches a page — its `first` argument is the single biggest lever on cost.
  Give it a default and a maximum, or a client will ask for 10,000.
- `Tweet.author` resolves the author *of each tweet*. Naively, ten tweets mean ten author
  lookups — the **N+1 problem**. Batch them per request with a DataLoader-style loader and it
  becomes one lookup.
- `Tweet.likeCount` may read a different store entirely, and if a field exposes private data,
  **its own resolver must check permissions** — there is no URL to protect.

## Overfetching, underfetching, and asking precisely

*(Compare the three modes above.)*

- **REST overfetching** — one call, but the endpoint returns the whole resource because it must
  serve every client. A mobile card renders four fields and downloads eleven.
- **REST underfetching** — the list gives `authorId`, not the author, so the client fans out one
  call per author and waits for the slowest.
- **GraphQL** — one call, tweets with their authors and nothing else.

The honest framing: **GraphQL is not automatically faster.** A REST endpoint purpose-built for
that exact screen would match it. What GraphQL buys is not raw speed but **not needing a new
endpoint every time a screen changes** — which is why it shines when many different clients
need many different shapes of the same graph.

## Guarding an endpoint that accepts any shape

*(Move the sliders above and watch a plausible query get rejected.)*

A REST endpoint has a cost you can reason about in advance. A GraphQL endpoint has **the cost
the client asks for**, and nesting multiplies: `first: 100` at three list levels is a million
rows. No malice required.

The standard defences:

- **Depth limiting** — refuse queries nested beyond N levels. Cheap and catches the worst shapes.
- **Cost analysis** — weight fields, estimate before executing, reject over budget. Rejecting
  *before* touching the database is the point.
- **Pagination caps** — every list argument gets a default and a maximum.
- **Persisted queries** — in production, accept only the queries you shipped, by hash. Arbitrary
  queries stop being possible.
- **Timeouts and per-resolver limits** — nothing runs forever.
- **Disable introspection** for non-public APIs in production.

## Caching is different, not impossible

REST gets HTTP caching almost for free: a `GET` with a URL is a cache key, and CDNs, browsers
and proxies all understand it. GraphQL usually posts to one URL, so that layer does not apply
out of the box. What replaces it:

- **Client-side normalized caches** keyed by object id (`__typename` + `id`).
- **Server-side caching per resolver or data source**, plus per-request batching.
- **Persisted queries over GET**, which puts a cacheable URL back on the table.

Not harder in principle — just deliberate work rather than a free ride.

## Trade-offs

- **Flexibility vs server complexity** — schema, resolvers, batching, cost limits, and an extra
  layer to operate.
- **Fewer round trips vs harder caching** — you gain a hop and lose HTTP caching by default.
- **Field-level authorization** — a real advantage in precision, but you must actually do it in
  every resolver that reads sensitive data.
- **Error semantics** — a GraphQL response can be `200 OK` with an `errors` array and partial
  data. Clients must check the body, not just the status code.
- **The team has to learn it** — schema design, loaders, and observability per resolver rather
  than per endpoint.

GraphQL does not replace REST. A very common, very sane setup is REST for the public API,
GraphQL for first-party apps, and **[webhooks](/en/topics/webhooks)** to notify partners.
See how the three relate in **[What is an API?](/en/topics/what-is-an-api)**.

## Interview relevance

- **Define it precisely** — "query language and runtime; the client specifies the fields;
  usually one endpoint over HTTP".
- **Never say "faster than REST".** Say it reduces overfetching and round trips *for some
  clients*, and that performance depends on the implementation.
- **Raise N+1 yourself** and name the fix (batching loaders). It is the question that follows.
- **Mention cost control** — depth limits, cost analysis, persisted queries. This is the maturity
  signal.
- **Say where authorization lives** — per field and per resolver, not per URL.
- **Be explicit about caching** and how you would recover it.

## Class notes

- The **client sends the shape**; the schema is the typed contract; resolvers do the work.
- Fixes **overfetching** and **underfetching** — by moving the cost to the server.
- **N+1** is the default failure mode; batch loaders are the standard fix.
- An endpoint that accepts any query needs a **budget**: depth limits, cost analysis, pagination
  caps, persisted queries.
- `200 OK` with an `errors` array is normal — clients must read the body.
