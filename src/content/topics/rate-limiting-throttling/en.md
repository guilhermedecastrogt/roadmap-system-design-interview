---
title: "Rate Limiting"
slug: rate-limiting-throttling
description: "Caps how fast a client can hit your system — rejecting the excess to protect against abuse, prevent overload, control cost, and keep things fair."
category: blocos-fundamentais
order: 60
difficulty: intermediate
status: published
tags: [rate-limiting, throttling, security, api, resilience, algorithms]
updatedAt: "2026-07-02"
beginnerSummary: >-
  Rate limiting sets a ceiling on how many actions a client can perform in a window of time — say
  100 requests per minute. Requests under the limit go through; the excess is rejected fast, usually
  with an HTTP 429 "Too Many Requests". It's how a system defends itself against brute-force attacks,
  runaway scripts, and traffic spikes, keeps one noisy client from starving everyone else, and stops
  a flood from running up an infrastructure bill. The limit is always counted against a key (an IP, a
  user id, an API key, a route…), and there are a handful of classic algorithms — fixed window,
  sliding window, token bucket, leaky bucket — that differ mainly in how they handle bursts.
glossary:
  - term: Rate limit
    definition: "A maximum allowed rate for some action — e.g. 100 requests per minute — over a defined time window. Requests beyond it are rejected or delayed."
  - term: Throttling
    definition: "Slowing a client down once it exceeds its allowance — by rejecting, delaying, or queueing requests — instead of letting it run unbounded."
  - term: 429 Too Many Requests
    definition: "The standard HTTP status a server returns when a client has sent too many requests in a given time. Often paired with a Retry-After header."
  - term: Key / dimension
    definition: "What the limit is counted against — an IP, user id, email, API key, endpoint, or a combination. It decides who shares a budget."
  - term: Fixed window
    definition: "Counts requests in discrete clock windows (e.g. each minute) and resets the counter at every boundary. Simple, but a burst across the boundary can allow up to 2× the limit."
  - term: Sliding window
    definition: "Counts requests over the trailing N seconds relative to now, so the window moves continuously. Smoother and more accurate than a fixed window, at the cost of more state."
  - term: Token bucket
    definition: "A bucket refills with tokens at a steady rate up to a capacity; each request spends a token. Allows bursts up to the bucket size while capping the average rate."
  - term: Leaky bucket
    definition: "Requests fill a bucket that drains (leaks) at a fixed rate; a full bucket overflows and drops requests. Produces a perfectly smooth output rate."
  - term: Burst
    definition: "A short spike of requests arriving much faster than the sustained rate. How gracefully each algorithm handles bursts is their main difference."
  - term: Distributed rate limiting
    definition: "Enforcing one shared limit across many nodes (e.g. several gateway instances). Requires shared state — commonly a Redis-backed counter — so the counts stay consistent."
references:
  - label: "MDN — 429 Too Many Requests"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
  - label: "Cloudflare — What is rate limiting?"
    url: https://www.cloudflare.com/learning/bots/what-is-rate-limiting/
  - label: "Stripe — Rate limiters (engineering blog)"
    url: https://stripe.com/blog/rate-limiters
  - label: "NGINX — Rate limiting with the leaky bucket"
    url: https://www.nginx.com/blog/rate-limiting-nginx/
---

> Use the interactive lab above to **watch the limiter work**: push the request rate past the limit
> and see requests get a 429, flood two servers and watch only the unprotected one melt down, then
> step through the four algorithms and see how each handles a burst. The notes below are the quick
> reference.

## What it is

**Rate limiting** sets a **maximum allowed rate** for some action — requests, logins, API calls,
operations — over a defined **time window**. For example: *100 requests per minute per user*.
Requests under the cap go through; the **excess is rejected** (typically with an HTTP **429 Too Many
Requests**) or delayed. **Throttling** is the general act of slowing a client down once it crosses
its allowance.

## Why it matters

Rate limiting is **not only a security feature** — it buys you four things at once:

- **Protection against abuse & attacks** — brute-force logins, credential stuffing, scraping, and
  bot floods all rely on sending *a lot* of requests. A limit blunts them.
- **Stability under load** — it stops a spike (or a buggy client in a retry loop) from pushing a
  service past its capacity and taking it down for everyone.
- **Cost control** — abusive or runaway traffic drives up compute, bandwidth, and third-party API
  bills. Rejecting the excess early caps the damage.
- **Fairness** — one noisy client can't monopolize a shared resource and starve well-behaved users.

## Where rate limiting lives

The same request passes through several layers, and a limit can sit at **any** of them — each with a
different reach and cost *(explore the placement map above)*:

- **Client / frontend** — disable the button, debounce, back off on 429. Good for **UX**, but
  trivially bypassed — **never** a security boundary.
- **API gateway** — the most common home: one central place to enforce per-key quotas across every
  service.
- **Reverse proxy (nginx / Envoy / CDN edge)** — cap requests per IP right at the door; cheap and
  very fast, but with coarser keys.
- **Backend service** — in-app limits (often Redis-backed) that key on user, plan, or business rules
  the edge can't see.

A real system often uses **several at once**: the edge sheds obvious floods by IP, the gateway
enforces per-user quotas, and the backend guards a few expensive operations.

## What we can limit on

A limit is always counted against a **key**. Choosing the key decides **who shares a budget**:

- **IP address** — great against anonymous floods, but shared NATs/proxies make many users look like
  one.
- **User id** — fair per account and survives IP changes; needs the request to be authenticated.
- **Email** — useful on signup / password-reset flows before a user id exists.
- **Endpoint / route** — give expensive or sensitive routes (like `POST /login`) their own tighter
  budget.
- **API key / token** — the standard for public APIs and billing tiers (free vs pro get different
  caps).
- **Combination** — compose keys for precision, e.g. *5 login attempts per IP + email per 15 min*.

## No rate limit vs rate limit

Fire the same flood at two servers *(see the comparison above)*. **Without a limit**, every request
is accepted, load climbs past capacity, latency explodes, and the server **falls over — for
everyone**. **With a limit**, traffic over the threshold is rejected **fast and cheap**, so the
server stays inside its capacity and keeps serving the requests that matter. A **429 is a feature**,
not a failure.

## The algorithms

All four answer the same question — *allow or block this request?* — but keep different state and
handle **bursts** differently.

### Fixed window

- **Example:** 100 requests per minute per user, counted in discrete windows (0–60s, 60–120s…).
- **State:** a single counter + the current window.
- **Decision:** allow while the counter is below the limit; **reset to 0** at each boundary.
- **Good for:** simplicity — cheap and easy to explain.
- **Trade-off:** a **burst straddling the boundary** can push through up to **2× the limit** in a
  short span (fill the window at 0:59, fill it again at 1:00).

### Sliding window

- **Example:** no more than 100 requests over the **last 60 seconds**, measured continuously.
- **State:** timestamps of recent requests (a log), or weighted per-window counts.
- **Decision:** allow if the count **inside the trailing window** is below the limit; old entries
  expire as the window slides.
- **Good for:** smooth, accurate limiting with **no boundary burst**.
- **Trade-off:** more state and bookkeeping than a fixed window.

### Token bucket

- **Example:** a bucket holds up to N tokens and **refills at a steady rate**; each request spends
  one token.
- **State:** a token count + the last refill time.
- **Decision:** if a token is available, spend it and allow; otherwise **block** until the bucket
  refills.
- **Good for:** allowing **controlled bursts** up to the bucket size while capping the **average**
  rate — a great fit for APIs.
- **Trade-off:** two knobs to tune (capacity vs refill rate); bursts are allowed by design.

### Leaky bucket

- **Example:** requests pour into a bucket that **drains at a fixed rate**; a **full bucket
  overflows** and drops the extras.
- **State:** a queue (the bucket) of pending requests.
- **Decision:** enqueue if there's room; **drop** on overflow. Requests leave at a **constant** rate.
- **Good for:** forcing a **perfectly smooth output rate** downstream — great for protecting a fragile
  dependency.
- **Trade-off:** adds queueing latency and allows **no bursts**, even when there's spare capacity.

> **Rule of thumb:** token bucket when you want to *allow* short bursts; leaky bucket when you want to
> *smooth them out*; sliding window when you need *accuracy*; fixed window when *simple and cheap* is
> enough.

## In-memory vs distributed

The simplest limiter is an **in-memory counter** inside one process — fast and trivial, but it only
knows about **its own node**. Behind a load balancer with several gateway or app instances, each
would enforce the limit **independently**, so the real cap becomes *limit × number of nodes*.

To enforce **one shared limit across nodes**, you need **shared state** — commonly a **Redis-backed
counter** (atomic increments with a TTL, or a token-bucket script). That's the standard mental model:
*in-memory for a single node or soft limits; a shared store like Redis for accurate distributed
limits.* The trade-off is an extra network hop and a dependency to keep available.

## Trade-offs

- **Protection vs user experience** — too strict and you 429 legitimate users; too loose and abuse
  slips through. Return **429 with `Retry-After`** so good clients can back off.
- **Performance vs complexity** — a per-IP proxy limit is cheap; accurate per-user distributed limits
  cost coordination.
- **Precision vs cost** — sliding-window logs are precise but heavier than a fixed-window counter.
- **Global vs per-user limits** — protect the *system* as a whole and be *fair* to individuals; you
  often need both.
- **In-memory vs distributed** — simple and fast vs consistent across a cluster.

## Interview relevance

- **When to bring it up** — any **public API**, **login / auth endpoint**, expensive operation, or
  "**protect against abuse / spikes / cost**" prompt should mention rate limiting.
- **Where you'd put it** — usually the **API gateway**; add an **edge/proxy** limit for IP floods and
  **backend** limits for a few sensitive routes.
- **Which algorithm** — **token bucket** is the safe default (allows bursts, caps the average);
  reach for **sliding window** when accuracy matters, **leaky bucket** to smooth output.
- **How to scale it** — call out **distributed limiting with a shared store (Redis)** so limits stay
  consistent across many nodes.
- **Say the honest part** — pick a **key** (IP / user / API key), return **429 + Retry-After**, and
  note that rate limiting protects **stability, cost, and fairness** — not just security.

## Class notes

- Default answer: **token bucket, keyed by API key or user, enforced at the gateway, backed by
  Redis, returning 429 + Retry-After.**
- Fixed window's flaw is the **boundary burst** — name it to show depth.
- "Protect the login endpoint" → tight **per-IP + per-email** limit with lockout/backoff.
- In-memory counters don't survive **multiple nodes** — say Redis the moment scale comes up.
