---
title: Load Balancer
slug: load-balancer
description: How a single virtual endpoint spreads traffic across many servers to gain scale and availability.
category: high-level-design
order: 10
difficulty: beginner
status: published
tags: [networking, availability, scalability]
updatedAt: 2026-01-20
beginnerSummary: >-
  A load balancer is the traffic cop in front of your servers. Clients talk to one
  address; the balancer quietly forwards each request to one of many identical servers
  behind it. That lets you add servers to handle more users, and keep serving traffic
  even when one server dies.
glossary:
  - term: Health check
    definition: A periodic probe (e.g. an HTTP request to /healthz) the balancer uses to decide whether a server should receive traffic.
  - term: Sticky session
    definition: Routing a given client to the same backend server for the duration of their session, usually via a cookie.
  - term: L4 vs L7
    definition: Layer 4 balancing routes by IP/port (TCP/UDP); Layer 7 routes by application data such as the HTTP path or headers.
  - term: VIP
    definition: Virtual IP — the single address clients connect to, which the balancer owns and maps to real backends.
references:
  - label: "AWS — What is load balancing?"
    url: https://aws.amazon.com/what-is/load-balancing/
  - label: "NGINX — HTTP load balancing"
    url: https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/
  - label: "Cloudflare — What is load balancing?"
    url: https://www.cloudflare.com/learning/performance/what-is-load-balancing/
---

## What it is

A **load balancer** sits between clients and a pool of servers. Clients send every
request to one stable address (a *virtual IP*), and the balancer decides which backend
server actually handles it. To the outside world the system looks like one machine; on
the inside it can be two servers or two thousand.

It is the most common answer to the very first scaling question in an interview:
*"You have more traffic than one server can handle — what now?"*

## Why it matters

A single server has two hard limits: it can only do so much work, and when it fails,
everything fails. A load balancer attacks both:

- **Scalability** — add more identical servers behind the balancer and capacity grows
  roughly linearly. This is *horizontal scaling*.
- **Availability** — if a server stops responding to health checks, the balancer simply
  stops sending it traffic. Users never notice.
- **Operability** — you can take a server out of rotation to deploy or patch it, then
  add it back, with zero downtime (rolling deploys).

## Key concepts

- **Balancing algorithm** — how the next server is chosen:
  - *Round robin* — each server in turn. Simple, assumes equal servers.
  - *Least connections* — the server with the fewest active connections. Better when
    requests vary in cost.
  - *Weighted* — bigger servers get a larger share.
  - *Hash-based* — a key (e.g. client IP) is hashed to a server, giving stickiness.
- **Health checks** — active probes decide which servers are eligible. A failing server
  is ejected and re-admitted automatically when it recovers.
- **L4 vs L7** — L4 is fast and protocol-agnostic; L7 understands HTTP and can route by
  path, terminate TLS, and rewrite headers.
- **Statelessness** — balancing is easiest when any server can handle any request, which
  means session state should live in a shared store (cache/DB), not on the server.

## Architecture discussion

In a typical web system the balancer is the front door:

```
            ┌──────────────┐
  client ──▶│ Load Balancer│──▶ app server 1
            │   (VIP)      │──▶ app server 2
            └──────┬───────┘──▶ app server 3
                   │  health checks ▲ ▲ ▲
                   ▼
             (the LB itself is replicated so it
              is not a single point of failure)
```

The balancer must not become the new single point of failure, so in production it is
itself redundant — for example two instances sharing a floating IP, or a managed,
multi-AZ service (AWS ELB, GCP Cloud Load Balancing). DNS can sit in front of multiple
balancers in different regions for geographic distribution.

## Components

- **Listener / VIP** — the address and port clients connect to.
- **Backend pool (target group)** — the set of servers eligible to receive traffic.
- **Health checker** — probes backends and updates their in/out status.
- **Scheduler** — applies the balancing algorithm to pick a backend per request.
- **TLS terminator** (L7) — decrypts HTTPS so backends can speak plain HTTP internally.

## Interfaces

- **Client ↔ Balancer** — standard TCP/HTTP(S); clients are unaware of the backends.
- **Balancer ↔ Backend** — forwarded connections, often with `X-Forwarded-For` /
  `X-Forwarded-Proto` headers so the app still knows the real client IP and scheme.
- **Control plane** — an API/config that registers and deregisters backends and defines
  health-check rules; this is what autoscaling and deploy tooling talks to.

## Flows

A normal request:

1. Client resolves the service's DNS name to the balancer's VIP.
2. Client opens a connection to the VIP.
3. The scheduler picks a healthy backend using the configured algorithm.
4. The balancer forwards the request and streams the response back.

A failure:

1. A backend stops answering health checks (timeout or error response).
2. The health checker marks it *unhealthy* and removes it from the pool.
3. New requests skip it; existing connections may be reset or drained.
4. When it passes health checks again, it is re-added — often gradually.

## Software engineering perspective

Treat the balancer as a contract: *any backend can serve any request*. Holding to that
contract is what keeps the design simple. Concretely:

- Keep app servers **stateless**; push session and user data to a shared cache or DB.
- Make health checks **meaningful** — check a real dependency, not just "the process is
  up", or you will route traffic to broken servers.
- Design for **connection draining** so in-flight requests finish during deploys.

## Trade-offs

- **Scalability vs complexity** — you gain horizontal scale but add a tier to operate,
  monitor, and secure.
- **L7 features vs cost/latency** — L7 routing, TLS termination, and inspection are
  powerful but cost CPU and add a little latency versus raw L4.
- **Stickiness vs balance** — sticky sessions simplify stateful apps but skew load and
  hurt failover; prefer shared state and skip stickiness when you can.
- **Cost vs availability** — running the balancer redundantly across zones costs more but
  removes it as a single point of failure.

## Interview relevance

The load balancer is almost always the **first box you draw** after the client. A strong
answer:

- Introduces it the moment you scale beyond one server.
- States that app servers are stateless so any server can handle any request.
- Mentions health checks and that the balancer itself must be redundant.
- Picks an algorithm and justifies it (round robin for uniform work, least connections
  for variable work).
- Notes L4 vs L7 only when it matters (e.g. path-based routing, TLS termination).

Common follow-ups: *"How does the balancer know a server is down?"* (health checks),
*"What happens to sessions on failover?"* (shared state), and *"Isn't the balancer a
single point of failure?"* (replicate it / use a managed multi-AZ service).

## Practical examples

- **Web tier** — an L7 balancer in front of a fleet of stateless API servers, routing
  `/api/*` to the API pool and `/` to the web pool.
- **Database reads** — a balancer (or smart client) spreading read queries across
  read replicas while writes go to the primary.
- **Global** — DNS-based or anycast routing sends users to the nearest regional
  balancer, which then balances locally.

## Class notes

- "Stateless servers + a load balancer" is the workhorse pattern for the web tier — reach
  for it first.
- Don't forget to replicate the balancer; an un-replicated LB just moves the single point
  of failure.
- Sticky sessions are a smell: usually it means state is in the wrong place.
