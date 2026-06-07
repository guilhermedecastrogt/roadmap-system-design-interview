---
title: Caching
slug: caching
description: Storing copies of expensive results close to where they're needed to cut latency and load — and the consistency cost that buys.
category: high-level-design
order: 20
difficulty: intermediate
status: published
tags: [performance, cache, consistency]
updatedAt: 2026-01-22
beginnerSummary: >-
  A cache is a small, fast store that keeps copies of data you'd otherwise recompute or
  refetch. Hit the cache and you save a slow database or network trip. The catch is that
  cached copies can go stale, so caching is really a trade between speed and freshness.
glossary:
  - term: Cache hit / miss
    definition: A hit is when the requested data is in the cache; a miss means you fall back to the source of truth.
  - term: TTL
    definition: Time to live — how long an entry stays valid before it expires and must be refetched.
  - term: Eviction policy
    definition: The rule for discarding entries when the cache is full (e.g. LRU — least recently used).
  - term: Cache stampede
    definition: Many requests missing on the same key at once and all hammering the source; mitigated with locks or request coalescing.
references:
  - label: "AWS — Caching overview"
    url: https://aws.amazon.com/caching/
  - label: "Redis — Caching patterns"
    url: https://redis.io/docs/latest/develop/use/patterns/
---

## What it is

A **cache** is a fast, usually in-memory store that holds copies of data so future
requests can be served without repeating expensive work — a database query, an API call,
or a heavy computation. Caching shows up at every layer: CPU caches, the browser, a CDN,
an application cache like Redis, and inside the database itself.

## Why it matters

Caching is the highest-leverage performance tool in most systems. A read served from
memory is orders of magnitude faster than one from disk or across the network, and every
cache hit is load that never reaches your database. In an interview, "add a cache" is
often the single biggest win you can propose for read-heavy systems.

## Key concepts

- **Where it lives** — client/browser, CDN (edge), application cache (Redis/Memcached),
  database query cache. Each is closer to the user and cheaper, but harder to invalidate.
- **Read strategies** — *cache-aside* (app checks cache, then DB, then fills cache) is the
  common default; *read-through* hides that behind the cache library.
- **Write strategies** — *write-through* (write cache + DB together), *write-back* (write
  cache now, DB later — fast but riskier), *write-around* (write DB, skip cache).
- **Expiry & eviction** — TTLs bound staleness; eviction policies (LRU/LFU) decide what to
  drop when full.
- **Invalidation** — keeping the cache in sync with the source of truth. Famously one of
  the two hard problems in computer science.

## Architecture discussion

```
client ─▶ CDN ─▶ load balancer ─▶ app ──(1) check──▶ cache (Redis)
                                    │                   │ miss
                                    └──(2) on miss──▶ database
                                       (3) fill cache ◀─┘
```

A read-heavy service typically layers a CDN for static/edge content and an application
cache for hot dynamic data. The database stays the source of truth; the caches absorb the
bulk of reads.

## Components

- **Cache store** — the in-memory key/value system (Redis, Memcached) or CDN edge nodes.
- **Cache client / library** — encapsulates the read/write strategy in the application.
- **Invalidation logic** — TTLs, explicit deletes on write, or event-driven busting.
- **Source of truth** — the database or service the cache fronts.

## Interfaces

- **App ↔ Cache** — simple `get(key)` / `set(key, value, ttl)` / `delete(key)` operations.
- **App ↔ DB** — the fallback path taken on a miss.
- **Invalidation channel** — on writes, the app (or a CDC/event stream) tells the cache to
  drop or update affected keys.

## Flows

Cache-aside read:

1. App looks up the key in the cache.
2. **Hit** → return the cached value.
3. **Miss** → read from the database, store it in the cache with a TTL, return it.

Write with invalidation:

1. App writes the new value to the database.
2. App deletes (or updates) the corresponding cache key.
3. The next read misses and repopulates fresh data.

## Software engineering perspective

- **Pick a key scheme** that's stable and collision-free (e.g. `user:123:profile`).
- **Always set a TTL** even when you invalidate explicitly — it's your safety net against
  bugs that leave stale data behind.
- **Guard against stampedes** with a short lock or "single-flight" so only one request
  rebuilds a hot key on miss.
- **Decide failure behavior**: if the cache is down, do you fall back to the DB (slower but
  correct) or fail fast? Usually fall back.

## Trade-offs

- **Speed vs freshness** — the core tension; lower TTLs are fresher but hit the source more.
- **Cost vs hit rate** — more memory means more hits, up to diminishing returns.
- **Complexity vs performance** — every cache adds an invalidation path that can serve
  wrong data if you get it wrong.
- **Write-back: throughput vs durability** — fast writes, but data can be lost if the cache
  dies before flushing.

## Interview relevance

- Reach for a cache the moment a system is **read-heavy** or has a **hot dataset**.
- State the **strategy** (cache-aside is a safe default) and the **invalidation** plan —
  vague "we'll cache it" answers get probed.
- Mention **TTLs** and at least acknowledge **stampede** and **stale data** as risks.
- Know that a **CDN is a cache** for static and edge content — propose it for media and
  geographically spread users.

## Practical examples

- **User profiles** — cache-aside in Redis with a 5-minute TTL; delete the key on profile
  update.
- **Product catalog** — CDN for images, app cache for product JSON; invalidate on price
  changes via an event.
- **Rate limiting / sessions** — Redis used as the fast shared store that makes app servers
  stateless.

## Class notes

- "Read-heavy" is the trigger word for caching — say it and reviewers nod.
- Never ship a cache without a TTL; explicit invalidation will eventually miss a case.
- A CDN counts as caching — don't forget the edge layer for media and static assets.
