---
title: "Architecting Twitter"
slug: architecting-twitter
description: "An end-to-end walkthrough of a Twitter-like social platform — accounts, tweets, follows, home timelines, likes, replies, retweets, media, and search — built from Redis, MongoDB, Kafka, Elasticsearch, and S3, and designed for low latency at 100M+ users."
category: exemplos-praticos
order: 10
difficulty: intermediate
status: published
tags: [system-design, twitter, timeline, fanout, redis, mongodb, kafka, elasticsearch, s3, cdn, cache, feed, case-study]
updatedAt: "2026-07-24"
beginnerSummary: >-
  Designing a Twitter-like system is really about one hard problem wrapped in many small ones:
  how do you show every user a fast, fresh home timeline of tweets from everyone they follow —
  at the scale of hundreds of millions of people? The trick is to separate concerns. Tweet
  content lives in a database (MongoDB here), but the timeline you actually read is served from
  an in-memory cache (Redis) so it feels instant. When you post, the write is saved and an event
  is dropped onto a queue (Kafka); background workers then fan the tweet out into followers'
  cached timelines, index it for search (Elasticsearch), and update counters — all without
  making you wait. Media (images, video) never goes in the tweet database; it goes to object
  storage (S3) and is delivered from a CDN. Search is its own separate index. This is a
  read-heavy system, so almost every decision is about making reads cheap and pushing slow work
  into the background. Use the interactive lab above to watch a tweet move through every stage.
glossary:
  - term: Home timeline
    definition: "The feed a user sees on opening the app — recent tweets from every account they follow, newest first. The hardest subsystem to make fast at scale."
  - term: Fanout
    definition: "Delivering one tweet to many followers. Fanout-on-write pushes it into each follower's timeline at post time; fanout-on-read assembles the feed when it is requested."
  - term: Fanout-on-write
    definition: "Precompute timelines: when a tweet is posted, write its id into every follower's cached feed. Reads become one fast lookup; writes get expensive for users with many followers."
  - term: Fanout-on-read
    definition: "Compute on demand: when a user loads their feed, pull recent tweets from everyone they follow and merge. Writes are cheap; reads get expensive and repetitive."
  - term: Fanout of doom
    definition: "The write amplification when a mega-account (tens of millions of followers) tweets under fanout-on-write — one post triggers tens of millions of timeline writes."
  - term: Read-heavy system
    definition: "A workload with far more reads than writes. Timelines are read constantly and written comparatively rarely, so the design optimizes reads and caches aggressively."
  - term: Timeline cache (Redis)
    definition: "Precomputed feeds and hot data (counters, recent tweet ids) held in memory so the home timeline returns in single-digit milliseconds instead of hitting several stores."
  - term: Event backbone (Kafka)
    definition: "A durable log of events (tweet-created, like-created, follow-created) that decouples the fast write path from slow downstream work like fanout, indexing, and notifications."
  - term: Source of truth
    definition: "The authoritative store for a piece of data. Tweets' source of truth is MongoDB; Redis only caches derived views and can be rebuilt from it."
  - term: Object key
    definition: "The unique id of a media object in S3. The tweet document stores this key (plus metadata) instead of the raw image or video bytes."
  - term: Inverted index
    definition: "The data structure behind full-text search: it maps each term to the documents containing it, enabling fast keyword lookup and relevance ranking in Elasticsearch."
  - term: Cache invalidation
    definition: "Removing or refreshing cached data when the underlying truth changes — e.g. expiring or updating a cached timeline after a new tweet or unfollow."
references:
  - label: "Twitter Engineering — The Infrastructure Behind Twitter: Scale"
    url: https://blog.twitter.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-scale
  - label: "Twitter Engineering — Timelines at Scale (InfoQ talk)"
    url: https://www.infoq.com/presentations/Twitter-Timeline-Scalability/
  - label: "Redis — documentation"
    url: https://redis.io/docs/latest/
  - label: "Apache Kafka — documentation"
    url: https://kafka.apache.org/documentation/
  - label: "MongoDB — documentation"
    url: https://www.mongodb.com/docs/
  - label: "Elasticsearch — the definitive guide"
    url: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
  - label: "Amazon S3 — documentation"
    url: https://docs.aws.amazon.com/s3/
---

> Use the lab above to **build the intuition by hand**: frame the requirements, trace a request
> through the layered architecture, then post a tweet, load a home timeline (warm and cold cache),
> upload media to S3, and run a search against Elasticsearch. The notes below are the quick
> reference — and a reminder that this is **one reasonable design**, not the only correct one.

## The problem

Design a social platform where people post short messages ("tweets"), follow each other, and open
the app to a **home timeline** — a feed of recent tweets from everyone they follow. Add likes,
replies, retweets, media, and search, and make it all feel instant for **100M+ users**.

The deceptively hard part is **the timeline**. Everything else — storing a tweet, following a
user — is straightforward on its own. Delivering a fast, fresh, personalized feed to hundreds of
millions of people, many following thousands of accounts, some followed by tens of millions, is
where the real system-design work lives.

## Functional requirements

- **Accounts & login** — sign up, authenticate, manage a profile.
- **Create, edit, delete tweets** — short posts, editable and removable.
- **Follow users** — build the social graph that decides who sees whom.
- **Home timeline** — recent tweets from followed accounts, newest first.
- **Like, reply, retweet** — engagement that ripples across the platform.
- **Search** — find tweets and users by keyword.
- **Upload media** — attach images and video to tweets.

## Non-functional requirements

- **Scale** — 100M+ users; billions of timeline reads per day.
- **High write volume** — floods of tweets, likes, retweets, replies, and searches.
- **High availability** — the feed stays up as individual parts fail.
- **Low latency** — the home timeline must feel instantaneous.
- **Security & privacy** — protect accounts, tokens, and private data.
- **Observability & recovery** — see what's happening; recover fast from failures.

## High-level architecture

A request flows **top to bottom** (trace it in the map above):

1. **Client** (web / iOS / Android) makes an HTTPS request.
2. **CDN** serves cached media and static assets from the edge; a **load balancer** spreads dynamic
   traffic across app instances.
3. **API Gateway** authenticates the caller, enforces **rate limits**, validates input, and routes
   to the right service.
4. **Services** — small, independently scaling units: Auth/IAM, Profile, Tweet, Reply, Timeline,
   Fanout, Follow-graph, Like/engagement, Search, Media, Notification.
5. **Data & event backbone** — **Redis** (cache/hot data), **MongoDB** (tweet content),
   **Kafka** (events), **Elasticsearch** (search), **S3** (media).

Each service owns its data and scales on its own axis: the read-heavy **Timeline** service scales
very differently from the **Search** service or the write-path **Tweet** service.

## Core components — and why each

- **Redis — timeline cache & hot data.** The home timeline is read far more than written, so
  precomputed feeds, counters (likes/retweets), and hot lookups live in memory for single-digit-ms
  reads. Redis is a **cache and hot-data layer, not the source of truth** for tweets.
- **MongoDB — tweet & reply content.** Tweets are document-shaped (text, author, timestamps, media
  refs, flexible fields). A document store fits and shards horizontally on tweet/author id. This is
  the **baseline** choice — other stores can work; the point is a scalable source of truth for
  content.
- **Kafka — event backbone.** Every write emits an event (`tweet-created`, `reply-created`,
  `like-created`, `follow-created`, `media-linked`). Kafka **decouples** the fast write path from
  slow downstream work so producers stay fast and consumers scale independently.
- **Elasticsearch — search index.** Full-text search over tweets/users needs an **inverted index**
  and relevance ranking. It's a **separate** layer, fed asynchronously — not the tweet DB queried
  directly.
- **Amazon S3 — media objects.** Images and video are large binary blobs stored durably and cheaply
  as objects; the tweet document keeps only the **object key**. A **CDN** serves them fast worldwide.

## Write path — posting a tweet

Run the "Post tweet" flow above. Only the first two steps are **synchronous**; everything after
Kafka is **asynchronous**:

1. **Gateway** authenticates, rate-limits, and validates the request.
2. **Persist** the tweet document in **MongoDB** (the source of truth).
3. **Publish** a `tweet-created` event to **Kafka**. The write path is now done — the client gets a
   fast OK.
4. **Fanout** consumer pushes the tweet id into followers' cached timelines.
5. **Redis** feeds gain the new tweet at the top.
6. **Search** consumer indexes the tweet in **Elasticsearch**.

Because fanout, cache updates, and indexing happen off the write path, the user **never waits** for
them. If a downstream consumer is briefly down, the event stays in Kafka and is processed on
recovery — the tweet is still safely stored.

## Timeline read path — loading the home feed

Run "Load home timeline" above with a cold and warm cache:

1. The **Timeline** service receives the request.
2. It checks **Redis** for the user's precomputed feed.
3. **Cache hit** → return the ready list in a few milliseconds. This is the common case.
4. **Cache miss** (cold cache, eviction, expiry) → rebuild from the tweet store and follow graph,
   then **repopulate Redis** so the next read is a hit.

The whole design bends toward making step 3 the norm. A warm cache turns a multi-store rebuild into
a single in-memory read — the difference between a feed that feels instant and one that stalls.

## Timeline strategies — fanout on write vs on read

This is the **hardest trade-off** in the system:

- **Fanout on write** — at post time, push the tweet id into every follower's precomputed timeline.
  Reads are dirt cheap (one Redis lookup). But a celebrity with 50M followers triggers **50M writes
  per tweet** — the "fanout of doom."
- **Fanout on read** — precompute nothing; assemble the feed at load time by pulling recent tweets
  from everyone the user follows. Writes are cheap, but reads become slow and repetitive for active
  users.

Real systems go **hybrid**: fanout-on-write for the vast majority of accounts, and fanout-on-read
(pull at load time) for a handful of mega-accounts, merged into the cached feed. In an interview,
**pick one baseline and name the exception** — that shows you understand the tension.

## Media path — S3 + CDN

Run "Upload media" above. Media is a **different concern** from tweet content:

1. The client uploads the file to the **Media** service — often via a **presigned S3 URL**, so the
   bytes skip your app tier entirely.
2. The object is stored durably in an **S3** bucket and gets an **object key**.
3. Only the **key + metadata** is saved on the tweet document in MongoDB — **never the bytes**.
4. Readers later fetch the media from the nearest **CDN edge** (first request per region is a MISS
   to the S3 origin; every request after is an edge HIT).

Large binaries never belong in the tweet database — they'd bloat storage, backups, and replication
for data the DB can't query anyway.

## Search path — Elasticsearch

Run the search demo above. Search is its **own subsystem**:

1. The query goes through the **gateway** to the **Search** service.
2. The service queries **Elasticsearch**, which ranks matches by relevance using its inverted index.
3. Results return to the client.

The index is kept in sync **asynchronously** through Kafka (`tweet-created` → index). At scale,
**search must not be coupled directly to the tweet database** — a separate index scales on its own
and can be tuned for relevance without touching the write path.

## Security, monitoring & operations

Operational concerns are **part of the design**, not an afterthought:

- **Auth & authorization** at the gateway — who is calling, and are they allowed?
- **Rate limiting** at the edge to absorb spikes and stop abuse.
- **Input validation** to reject malformed or malicious payloads early.
- **Encryption** — TLS in transit, encryption at rest for stored data.
- **Logging, metrics & alerts** — structured logs and pages when SLOs slip.
- **Health checks** so load balancers route only to healthy instances.
- **Load & automated testing** to prove capacity and catch regressions.
- **Backup & recovery** — snapshots plus Kafka replay so no data is lost for good.

## Trade-offs

- **Consistency vs latency** — the timeline is **eventually consistent** (a new tweet appears a beat
  later). That's an acceptable trade for an instant-feeling feed.
- **Cache freshness** — warm caches are fast but can go stale; invalidation after new tweets and
  unfollows is ongoing work.
- **Async propagation** — decoupling with Kafka adds moving parts and eventual consistency in
  exchange for a fast, resilient write path.
- **Storage separation** — splitting content (MongoDB), cache (Redis), media (S3), and search
  (Elasticsearch) adds operational surface but lets each scale independently.
- **Complexity vs scalability** — every one of these choices trades simplicity for the ability to
  reach hundreds of millions of users.

## How a Staff Engineer would think

Junior answers list components. Staff answers show **judgment** — how the system behaves under
scale, failure, and cost pressure. The failure simulator above is a first taste; here's the wider
checklist worth raising unprompted:

- **Multi-region & disaster recovery** — run in multiple regions with cross-region replication of
  MongoDB, S3, and Kafka. Define **RPO/RTO** (how much data you can lose, how fast you recover),
  fail over with global load balancing, and rehearse the failover — an untested DR plan is a wish.
- **Hot partitions** — a celebrity or a viral tweet concentrates load on one shard/key. Mitigate by
  sharding on a high-cardinality key, splitting hot keys, and adding a small read-replica/cache tier
  in front of the hottest data.
- **The celebrity problem** — accounts with tens or hundreds of millions of followers are excluded
  from fanout-on-write and pulled in at read time. Be ready to state the **follower cutoff** where
  you switch strategies, and how you merge pulled tweets into the cached feed.
- **Timeline reprocessing & backfill** — you *will* need to rebuild timelines (a bug in ranking, a
  new feature, a corrupted cache). Design for it: replay from Kafka or recompute from the source of
  truth, throttled so backfill doesn't starve live traffic.
- **Redis cost control** — in-memory RAM is the expensive part. Cap timeline length (e.g. last ~800
  ids), set TTLs, only cache **active** users' feeds, and rebuild cold users on demand rather than
  keeping 100M feeds hot forever.
- **Consistency & idempotency** — events can be delivered more than once, so consumers (fanout,
  counters, indexing) must be **idempotent**. Counters drift; reconcile them periodically from the
  source of truth rather than trusting increments forever.
- **Abuse, safety & privacy** — rate limits and spam detection on the write path, private/protected
  accounts that change fanout visibility, and deletion that must propagate to caches, search, and
  timelines (not just the source of truth).
- **Rollout & observability** — ship risky changes behind flags and canaries, watch p99 feed
  latency and consumer lag as first-class SLOs, and alert on the derived layers going stale, not
  just on hard errors.

Raising even three or four of these unprompted is what separates "knows the components" from
"would be trusted to own the system."

## Interview relevance

- **Split read path from write path out loud.** "This is a read-heavy system; I'll optimize the
  timeline read and push slow work into the background."
- **Make the timeline a first-class problem.** Name fanout-on-write vs on-read, the fanout-of-doom,
  and the hybrid resolution. This is what interviewers are listening for.
- **Justify each store in one line** — Redis (hot feed cache), MongoDB (tweet source of truth),
  Kafka (event backbone), Elasticsearch (search index), S3 (media). Say what each is **not**: Redis
  isn't the source of truth; media isn't in the DB; search isn't the tweet DB.
- **Explain why async helps** — Kafka lets the write return fast, isolates failures, and lets
  fanout/indexing/notifications scale and recover independently.
- **State the consistency trade** — the feed is eventually consistent, and that's fine.
- **Frame it as one reasonable design**, then discuss where you'd choose differently (e.g. a
  relational or wide-column store for content, pull-based timelines, etc.).

## Class notes

- The whole system is an answer to one question: **how do we serve a fast home timeline at scale?**
- **Cache the timeline, queue the side effects.** Reads hit Redis; writes drop an event and return.
- **Separate concerns**: content ≠ cache ≠ media ≠ search. Each has its own store and its own scale.
- Redis is **hot and derived**; MongoDB is the **truth**. You can always rebuild Redis from Mongo.
- There is **no single correct architecture** — this is a defensible baseline you can reason about
  and adapt.
