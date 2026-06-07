---
title: Load Balancer
slug: load-balancer
description: "Spreads incoming traffic across many servers so no single one is overwhelmed — the backbone of scalability and availability."
category: blocos-fundamentais
order: 30
difficulty: beginner
status: published
tags: [load-balancer, networking, scalability, availability, infrastructure]
updatedAt: "2026-06-07"
beginnerSummary: >-
  A load balancer sits in front of several servers and spreads incoming requests across
  them, so no single server is overwhelmed. It improves scalability, availability, and
  fault tolerance — and when a server fails its health check, the balancer simply routes
  around it.
glossary:
  - term: Load balancer
    definition: "A component that distributes incoming requests across a pool of servers to improve scale, availability, and fault tolerance."
  - term: Health check
    definition: "A periodic probe that tells the balancer which servers are healthy; unhealthy ones are removed from rotation."
  - term: Round Robin
    definition: "Sends each request to the next server in turn — simple and even when servers are similar."
  - term: Least Connections
    definition: "Routes to the server with the fewest active connections right now — adapts to real load."
  - term: IP Hash
    definition: "Hashes the client IP so the same client always lands on the same server (session affinity)."
  - term: Sticky session
    definition: "Pinning a user to one server (via cookie or IP hash) so their session state stays put."
  - term: L4 vs L7
    definition: "L4 routes by IP and TCP/UDP ports; L7 reads HTTP path, host, headers and cookies."
  - term: TLS termination
    definition: "The balancer decrypts HTTPS so backends can speak plain HTTP internally."
references:
  - label: "Cloudflare — What is load balancing?"
    url: https://www.cloudflare.com/learning/performance/what-is-load-balancing/
  - label: "NGINX — HTTP load balancing"
    url: https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/
  - label: "AWS — Elastic Load Balancing"
    url: https://aws.amazon.com/elasticloadbalancing/
---

> Use the interactive lesson above to **run the traffic**: switch routing methods, watch
> requests spread across the servers, and click a server to fail it and see traffic
> reroute. The notes below are the quick reference.

## What it is

A **load balancer** sits in front of a pool of servers and spreads incoming requests
across them. To the client it looks like one address; behind it, many identical servers
share the work.

## Why one server isn't enough

One server has two hard limits: it can only do so much work, and if it dies, **everything**
dies. Put a balancer in front of several servers and you gain:

- **Scalability** — add servers to handle more traffic.
- **Availability & fault tolerance** — if one server fails, traffic goes to the others.
- **Sustainability** — no single machine runs hot while others sit idle.

## Where it fits

Load balancers aren't just at the front door — they show up at **every tier that scales**:

- **At the edge** — spreading users across the web/frontend servers.
- **Between services** — balancing internal calls across backend microservices.
- **At the data layer** — spreading **reads** across database replicas (writes go to the primary).

*(See the "where load balancers live" diagram above.)*

## Routing methods

How the next server is chosen — try each in the lab above:

- **Round Robin** — each server in turn.
- **Weighted Round Robin** — bigger servers get a bigger share (e.g. 3:2:1).
- **Least Connections** — whoever has the fewest active connections now.
- **Least Response Time** — the fastest (lowest-latency) healthy server.
- **IP Hash** — same client IP → same server (stickiness).
- **URL Hash** — paths like `/video`, `/profile`, `/admin` map to fixed servers.

## Health checks & failure

The balancer constantly **health-checks** its servers. When one stops responding, it's
**removed from rotation** and traffic is redistributed to the healthy ones — automatically,
with no user impact. (Fail a server in the lab to watch this happen.)

## Static vs Dynamic

- **Static** — fixed rules that don't know the real server state (Round Robin, IP/URL Hash).
- **Dynamic** — adapts to live state like load and latency (Least Connections, Least Response Time).

## Stateful vs Stateless

- **Stateful (sticky)** — a user is pinned to one server (cookie / IP hash) so in-server
  session data stays put. Simpler app, but uneven load and harder failover.
- **Stateless** — any server can serve any request. Easy to scale and fail over, but session
  data must live in a **shared store**. Prefer this when you can.

## L4 vs L7

- **L4 (transport)** — routes by **IP and TCP/UDP ports**. Fast and protocol-agnostic.
- **L7 (application)** — reads **HTTP path, host, headers, cookies**, so it can do path-based
  routing, TLS termination, and sticky cookies. A bit more work, much smarter.

## Other capabilities

- **Health checking** — know which servers can take traffic.
- **Dynamic provisioning** — handle pools that grow/shrink (autoscaling).
- **TLS termination** — decrypt HTTPS at the edge so backends speak plain HTTP.
- **Security** — help with DDoS mitigation and traffic filtering.

## Trade-offs

- **Performance & availability** improve — but the balancer is a **tier to run and secure**,
  and must itself be **redundant** (or it becomes the new single point of failure).
- **Dynamic methods** route smarter but add **observability/monitoring** overhead.
- **Sticky sessions** simplify stateful apps but **skew load** and complicate failover.
- **L7** unlocks rich routing at a small **latency/cost**; **L4** is leaner.

## Interview relevance

The load balancer is usually the **first box you draw** after the client:

- Introduce it the moment you scale past one server, with **stateless** app servers.
- Pick a method and justify it (Round Robin for uniform work; Least Connections for variable).
- Mention **health checks** and that the **balancer itself must be redundant**.
- Bring up **L4 vs L7** only when it matters (path routing, TLS termination).

## Class notes

- Stateless servers + a load balancer is the workhorse pattern — reach for it first.
- Static = fixed rules; Dynamic = reacts to load/latency.
- Always replicate the balancer; an un-replicated LB just moves the single point of failure.
