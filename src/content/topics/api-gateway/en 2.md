---
title: API Gateway
slug: api-gateway
description: A single managed entry point that handles routing, auth, rate limiting, and cross-cutting concerns in front of many services.
category: high-level-design
order: 30
difficulty: intermediate
status: in-progress
tags: [api, security, microservices]
updatedAt: 2026-01-24
beginnerSummary: >-
  An API gateway is the one front door to a system made of many services. Instead of every
  client knowing every service, they all talk to the gateway, which authenticates them,
  enforces limits, and routes each request to the right service behind the scenes.
glossary:
  - term: Cross-cutting concern
    definition: A responsibility shared by many services (auth, logging, rate limiting) that a gateway centralizes so each service doesn't reimplement it.
  - term: Rate limiting
    definition: Capping how many requests a client may make in a window to protect the system from abuse and overload.
  - term: BFF
    definition: Backend for Frontend — a gateway-like layer tailored to one client (web, mobile) that aggregates and shapes responses for it.
references:
  - label: "Microsoft — API Gateway pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway
  - label: "Kong — What is an API gateway?"
    url: https://konghq.com/learning-center/api-gateway
---

## What it is

An **API gateway** is a server that is the single entry point for a set of backend
services. Clients send requests to the gateway, which handles cross-cutting concerns —
authentication, rate limiting, routing, TLS termination, logging — and forwards each
request to the appropriate service. It is the "reverse proxy with a brain" in front of a
microservices system.

## Why it matters

Without a gateway, every client must know the address of every service, and every service
must re-implement auth, throttling, and logging. A gateway pulls those shared concerns into
one place, simplifying both clients and services, and giving you a single point to enforce
security and observability.

## Key concepts

- **Routing** — map an incoming path (`/orders`) to the right backend service.
- **Authentication & authorization** — verify a token once, at the edge, before traffic
  reaches services.
- **Rate limiting & throttling** — protect services from abusive or runaway clients.
- **Aggregation** — combine several backend calls into one client response (often via a BFF).
- **Observability** — a natural choke point for logging, tracing, and metrics.

## Architecture discussion

```
                        ┌──────────────┐──▶ users-service
 client ─▶ API Gateway ─│  auth, rate  │──▶ orders-service
                        │  limit, route│──▶ payments-service
                        └──────────────┘──▶ search-service
```

The gateway sits just inside the load balancer (or is fronted by one for its own scale).
It must stay thin and fast — heavy business logic belongs in the services, not the gateway.

## Components

- **Router** — matches requests to backends by path, host, or header.
- **Auth filter** — validates tokens/keys and rejects unauthorized requests early.
- **Rate limiter** — counts requests per client (often backed by Redis).
- **Transformer / aggregator** — rewrites requests/responses or fans out to several services.

## Interfaces

- **Client ↔ Gateway** — a single, stable public API (REST/GraphQL).
- **Gateway ↔ Services** — internal calls over the private network to each service.
- **Gateway ↔ Auth/identity** — token validation against an auth service or via signed JWTs.

## Flows

1. Client sends a request with an auth token to the gateway.
2. Gateway validates the token and checks the client's rate limit.
3. Gateway routes the request to the matching service (optionally aggregating several).
4. Gateway returns the (possibly reshaped) response and records metrics/traces.

## Software engineering perspective

- **Keep it stateless and thin** so it scales horizontally like any other web tier.
- **Centralize, don't monopolize** — shared concerns live here; business rules do not.
- **Plan for it as a single point of failure** — run multiple instances behind a load
  balancer; a gateway outage takes everything down.

## Trade-offs

- **Simplicity for clients vs a new hop** — one front door, but added latency and a tier to
  operate.
- **Centralized control vs bottleneck risk** — great for policy, dangerous if it becomes a
  fragile choke point.
- **Aggregation vs coupling** — combining calls helps clients but can couple the gateway to
  service internals.

## Interview relevance

- Introduce a gateway once you move from a monolith to **multiple services**.
- Use it to answer "where does **auth / rate limiting** happen?" — at the edge, in the gateway.
- Acknowledge it as a **single point of failure** and replicate it.
- Distinguish it from a plain load balancer: the gateway adds **application-level** concerns.

## Practical examples

- A mobile + web product uses a **BFF** gateway per client to aggregate profile, feed, and
  notification services into one response.
- A public API platform uses the gateway for **API keys, quotas, and per-plan rate limits**.

## Class notes

> This topic is **in progress** — the components and flows sections could use a concrete
> diagram and a worked aggregation example. Contributions welcome.

- Gateway = reverse proxy + auth + rate limiting + routing, all at the edge.
- Don't confuse it with a load balancer; the gateway is application-aware.
