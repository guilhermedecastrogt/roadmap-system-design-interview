---
title: Cache
slug: caching
description: "A small, fast store that keeps copies of hot data close by — trading a little freshness for a lot of speed."
category: blocos-fundamentais
order: 40
difficulty: intermediate
status: published
tags: [cache, performance, redis, http, infrastructure]
updatedAt: "2026-06-07"
beginnerSummary: >-
  A cache is a small, fast (and pricier) store that keeps copies of frequently used data
  close to where it's needed — so you avoid slow, repeated work like database queries or
  cross-region trips. The catch: cached copies can go stale, so caching trades a little
  freshness for a lot of speed.
glossary:
  - term: Cache hit / miss
    definition: "A hit is served from the cache; a miss means the data isn't cached, so you fall back to the source (and usually cache it)."
  - term: TTL
    definition: "Time To Live — how long a cached entry can be reused before it expires and must be refreshed."
  - term: Cache-aside
    definition: "The app checks the cache, and on a miss reads the database and fills the cache itself."
  - term: Read / Write-through
    definition: "The cache sits between app and database; reads and writes flow through the cache, which keeps itself populated."
  - term: Cache-Control
    definition: "HTTP header that sets how long browsers and CDNs may reuse a response (e.g. max-age for the browser, s-maxage for the CDN)."
  - term: ETag
    definition: "A version fingerprint for a response. The browser revalidates with If-None-Match; the server replies 304 Not Modified if unchanged."
  - term: Vary
    definition: "Tells caches which request headers change the response (e.g. Vary: Accept-Encoding), so they don't serve the wrong variant."
  - term: Eviction
    definition: "When the cache is full, a policy (e.g. LRU — least recently used) decides which entries to drop."
references:
  - label: "Cloudflare — What is caching?"
    url: https://www.cloudflare.com/learning/cdn/what-is-caching/
  - label: "Redis — Caching patterns"
    url: https://redis.io/docs/latest/develop/use/patterns/
  - label: "MDN — HTTP caching"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
---

> Use the interactive lesson above to **feel the difference**: flip the cache on to watch
> latency and database load collapse, run cache-aside vs read/write-through, and see where
> caches live. The notes below are the quick reference.

## What it is

A **cache** is temporary, fast storage that holds copies of data you'd otherwise recompute
or refetch. Hit the cache and you skip the slow path — a database query, a cross-region
trip, or a heavy computation.

## Why it matters

Cache memory is **smaller, faster, pricier, and not for long-term storage** — and that's
the whole point. A read from memory is orders of magnitude faster than one from disk or
across the network. Every hit:

- **saves resources** and lets you **serve more clients**,
- **improves responsiveness**, and
- **reduces pressure** on the backend and database.

## The latency problem

A client in **São Paulo** hits a backend and database in **us-east-1**. Without a cache,
every request crosses the continent to query the DB — easily **100–300 ms**. A cache near
the client (or backend) serves repeat reads in **single-digit milliseconds**. *(Flip the
lab above to see it.)*

## Where caches live

Caching isn't one box — it happens at **every hop**:

- **Browser cache** — static assets stored on the device (no network).
- **CDN edge cache** — images, video, and assets from a nearby edge.
- **Backend cache** — an in-memory store like **Redis / Memcached** for hot data, sessions,
  and expensive queries, close to the backend or as a managed service.

## Cache hit vs miss

- **Hit** — the data is in the cache → return it instantly.
- **Miss** — it isn't → fetch from the source, store it, then return it. The next read is a hit.

## What to cache (and what not)

Good candidates: **frequently read data, expensive computations, static assets**, and
sometimes **session/auth checks**. Avoid caching **everything**, **highly sensitive data**
without care, **rarely used** data, or data that **goes stale instantly** with no plan.

## Cache-aside

The most common pattern. The app is in charge:

1. Request for product X reaches the backend.
2. Backend checks the cache (e.g. Redis).
3. **Hit** → return it. **Miss** → read the database, **populate the cache**, then return.

## Read-through / write-through

The cache sits **between** the app and the database:

- **Read-through** — the app reads only from the cache; on a miss, the **cache** fetches
  from the DB and caches it.
- **Write-through** — writes go through the cache to the DB together, so the cache stays
  consistent (at the cost of slower writes).

## HTTP caching controls

For web content, caching is driven by headers:

- **`Cache-Control: public, max-age=60, s-maxage=3600`** — browser caches 60s, CDN caches 1h.
- **`ETag`** — a version fingerprint; the browser revalidates with `If-None-Match` and gets a
  cheap `304 Not Modified` if nothing changed.
- **`Vary`** — tells caches which request headers change the response (e.g.
  `Vary: Accept-Encoding`), so they don't serve the wrong variant.

## Trade-offs

Cache is **not** just "faster storage" — it adds real trade-offs:

- **Speed vs freshness** — cached data can be **stale**; TTLs bound how stale.
- **Invalidation is hard** — knowing *when* to drop or update an entry is one of the classic
  hard problems.
- **Consistency** — more copies of data mean more chances they disagree.
- **Complexity** — every cache is another moving part and another failure mode.

## Interview relevance

- **Why it helps** — fewer slow trips; **reads served from memory**.
- **How it shields the DB** — hits never reach the database (watch the DB counter in the lab).
- **What to cache** — hot, read-heavy, expensive data; not everything.
- **Stale data & invalidation** — name the trade-off; mention TTLs and purge.
- **CDN vs backend cache** — CDN for static/edge content; Redis for hot dynamic data.

## Class notes

- "Read-heavy" is the trigger word for caching — lead with it.
- Cache-aside = app fills the cache; read/write-through = the cache layer does.
- Never ship a cache without a freshness plan (TTL + invalidation).
