---
title: CDN
slug: cdn
description: "A network of servers that caches your content close to users — cutting latency and offloading the origin."
category: blocos-fundamentais
order: 20
difficulty: beginner
status: published
tags: [cdn, networking, caching, performance, infrastructure]
updatedAt: "2026-06-07"
beginnerSummary: >-
  A CDN (Content Delivery Network) is a fleet of servers spread around the world that cache
  your content close to users. Instead of every request traveling to a distant origin, a
  user hits a nearby edge server — which means lower latency, less load on the origin, and
  better use of regional capacity.
glossary:
  - term: Origin
    definition: "Your main data center — the source of truth for all content. The CDN exists so most users never reach it."
  - term: Edge / Proxy server
    definition: "A cache close to the user that serves content directly, cutting latency and origin load."
  - term: Routing system
    definition: "Knows where content lives and points each client to the best (usually closest) edge server."
  - term: Distribution system
    definition: "Replicates content from the origin out to the edge servers."
  - term: Scrubbers
    definition: "Filter out malicious traffic (e.g. DDoS) before it reaches the edge. Optional, but the edge is more exposed without them."
  - term: Push CDN
    definition: "Content is proactively pushed to edges ahead of time — good for known, popular, static assets."
  - term: Pull CDN
    definition: "The edge fetches content from the origin on the first request, then caches it — good for unpredictable content."
  - term: Edge cache hit / miss
    definition: "A hit is served from the edge; a miss makes the edge fetch from the origin first, then cache it."
  - term: TTL & Cache-Control
    definition: "How long browsers and CDNs may reuse a cached response (e.g. max-age for the browser, s-maxage for the CDN)."
  - term: Cache invalidation
    definition: "Purging or versioning content (e.g. a hash in the filename) so users get the new version before the TTL expires."
references:
  - label: "Cloudflare — What is a CDN?"
    url: https://www.cloudflare.com/learning/cdn/what-is-a-cdn/
  - label: "AWS — What is a CDN?"
    url: https://aws.amazon.com/what-is/cdn/
  - label: "MDN — CDN"
    url: https://developer.mozilla.org/en-US/docs/Glossary/CDN
---

> Use the interactive lesson above to **see it work**: flip the CDN on to watch latency
> shrink, simulate the full request flow, compare push vs pull, and trace hierarchical vs
> horizontal topologies. The notes below are the quick reference.

## What it is

A **CDN (Content Delivery Network)** is a group of geographically distributed servers that
cache copies of your content close to users. The user fetches from a nearby **edge server**
instead of the distant **origin**.

It can serve almost anything static or cacheable: **video, images, audio, HTML, static
sites, assets, and downloadable files** — or just part of a page.

Modern CDNs also **accelerate dynamic content** (TLS termination, HTTP/2·3, compression,
edge routing) and add **security** (WAF, DDoS protection, edge functions) — but caching
static/cacheable content is the core idea.

## Why it matters

- **Lower latency** — content travels a shorter distance.
- **Less load on the origin** — most requests are absorbed by the edge.
- **Better locality** — users are served from their region.
- **Regional capacity** — traffic spreads across many data centers instead of one.

## Real-world motivation

A user in **Europe** wants to watch **Netflix**, but the main server is in the **US**.
Sending every byte across the Atlantic means high latency and a hammered origin. A CDN puts
a copy of the video on an **edge server in Europe**, so the user streams from nearby. (Flip
the latency lab above to feel the difference.)

## How the request flows

The main pieces are the **origin**, **routing system**, **distribution system**, **edge /
proxy servers**, **scrubbers**, and a **management system**. In short:

1. You configure the CDN with an **origin and cache rules**, so it knows where to fetch.
2. The distribution system replicates content out to the edges.
3. The client asks routing for the best destination → gets the **best edge** (usually the
   closest, healthy one — chosen by latency/load, not just raw distance).
4. The request passes through scrubbers, reaches the edge, and the edge returns the content.

*(Tap each component in the diagram above to see what it does.)* A CDN may support
operations like **retrieve, request, deliver, search, update, and delete** on content.

## Push vs Pull

- **Pull CDN** — the edge fetches from the origin on the **first request**, then caches it.
  The **common default**: first hit is a miss, the rest are fast. Popular static assets work
  great here too (cached after the first miss).
- **Push CDN** — you **pre-load** content to the edges ahead of time. Worth it for
  **launches, large files/video, and avoiding a slow first hit** — but it's more to manage.

## Hierarchical vs horizontal

- **Horizontal** — the origin replicates to many edges at the **same level**. Simple and flat.
- **Hierarchical** — **origin → parent servers → child servers**. Tiers absorb load and keep
  content close; children serve users while parents shield the origin.

## Cache freshness (TTL & invalidation)

The classic CDN trade-off — **freshness vs performance**:

- **High TTL** → faster and cheaper, but users may get **stale** content.
- **Low TTL** → fresher, but more requests go back to the origin.
- **Purge / invalidation** forces the CDN to drop or update content before the TTL expires.
- **Version your asset URLs** (`app.v123.js` or a content hash) so a new deploy can't serve
  an old cached file.
- HTTP headers drive it, e.g. `Cache-Control: public, max-age=60, s-maxage=3600` → the
  browser caches 60s, the CDN caches 1h.

## Trade-offs & practical notes

- **Latency & origin load** drop — but you add **more infrastructure** to run and pay for.
- **Cache freshness** becomes a concern: edges can serve **stale** content until it expires
  or is purged (TTLs and cache invalidation matter).
- **Security** (WAF, DDoS protection, scrubbers) is a common **add-on**, not part of the
  basic CDN concept — handy, but extra moving parts.
- **Cost** scales with traffic and footprint; great for read-heavy, static-heavy workloads.

## Interview relevance

Expect to explain, not just name-drop:

- **Why a CDN reduces latency** (shorter distance) and **origin load** (edge absorbs reads).
- **When to use push vs pull** (pull is the default; push to pre-warm launches/large files).
- **How edge caching changes traffic** (first miss fills the cache; later hits skip origin).
- **Why routing and replication matter** (route to the **best** edge — usually closest &
  healthy, by latency/load — and keep copies near users).
- **Cache freshness** (TTL vs staleness, purge, and versioned asset URLs).
- **What trade-offs more components bring** (complexity, cost, cache freshness, security).

## Class notes

- CDN = cache content **close to users** → lower latency, less origin load.
- **Pull** = cache on first request (the default); **Push** = pre-load for launches/large files.
- Route to the **best** edge (latency/health), not just the geographically nearest.
- More edges/tiers help scale, but watch **cache freshness** (TTL, purge, versioning) and **cost**.
