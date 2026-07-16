---
title: "API Gateway"
slug: api-gateway
description: "The front door of a service architecture — one entry point that authenticates, validates, rate-limits, and routes every request before it reaches your services."
category: blocos-fundamentais
order: 80
difficulty: intermediate
status: published
tags: [api-gateway, microservices, security, routing, api, architecture]
updatedAt: "2026-07-16"
beginnerSummary: >-
  An API gateway is the single front door to a system made of many services. Instead of the
  frontend knowing and calling every service directly, it sends every request to the gateway,
  which runs a pipeline of checks — who are you (authentication), may you do this
  (authorization), is the request well-formed (validation), are you within quota (rate
  limiting) — and only then routes it to the right service, sometimes translating HTTP/JSON
  into a faster internal protocol like gRPC along the way. Requests that fail a check are
  rejected at the door with a clear status code, so services behind the gateway stay focused
  on business logic. It's a policy and control layer, not just a router — but it should stay
  thin: business logic that piles up in the gateway turns it into a bottleneck.
glossary:
  - term: API gateway
    definition: "A server that is the single entry point for a set of backend services. It applies shared policies (auth, validation, rate limits) and routes each request to the right service."
  - term: Single entry point
    definition: "The pattern of exposing one public address for the whole system. Clients never learn internal service addresses, so internals can change freely."
  - term: Authentication (authn)
    definition: "Verifying who the caller is — validating a JWT, API key, or session. Fails with 401 Unauthorized."
  - term: Authorization (authz)
    definition: "Checking whether the authenticated caller may perform this action on this resource. Fails with 403 Forbidden."
  - term: Request validation
    definition: "Rejecting malformed requests (bad JSON, missing fields, wrong types) with a 400 before they reach a service."
  - term: Rate limiting
    definition: "Capping how many requests a client may make in a time window; the excess is rejected with 429 Too Many Requests."
  - term: Routing
    definition: "Mapping an incoming request to the right backend service — usually by path prefix (/users → user service), but also by method, host, or header."
  - term: Protocol translation
    definition: "Accepting one protocol at the edge (HTTP/JSON) and speaking another internally (gRPC, protobuf) — the gateway converts between the two."
  - term: gRPC
    definition: "A high-performance RPC protocol built on HTTP/2 and protobuf binary encoding, common for service-to-service calls inside the network."
  - term: Cross-cutting concern
    definition: "A responsibility every service would otherwise duplicate (auth, logging, rate limiting) that the gateway centralizes in one place."
  - term: BFF (Backend for Frontend)
    definition: "A gateway variant tailored to one client type (web, mobile), aggregating and shaping responses for that client's needs."
  - term: Single point of failure
    definition: "A component whose failure takes the whole system down. A gateway is one by design, so it must be replicated and kept simple."
references:
  - label: "Microsoft — API gateway pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway
  - label: "NGINX — What is an API gateway?"
    url: https://www.nginx.com/learn/api-gateway/
  - label: "Kong — What is an API gateway?"
    url: https://konghq.com/learning-center/api-gateway/what-is-an-api-gateway
  - label: "microservices.io — API Gateway pattern"
    url: https://microservices.io/patterns/apigateway.html
  - label: "gRPC — Introduction"
    url: https://grpc.io/docs/what-is-grpc/introduction/
---

> Use the control tower above to **watch requests move through the gateway**: send a valid
> request and follow it checkpoint by checkpoint to a service, then send a broken one and see
> exactly which layer bounces it. Toggle the architecture with and without a gateway, dispatch
> requests through the routing table, and watch HTTP become gRPC. The notes below are the
> quick reference.

## What it is

An **API gateway** is an **intermediate layer between clients and backend services** — the
single front door of the system. Every request follows the same round trip:

**Frontend → API Gateway → service → API Gateway → frontend**

The gateway receives each request, runs it through a **pipeline of policies** — authentication,
authorization, validation, rate limiting — and only then **routes** it to the internal service
that should handle it, relaying the response back to the client.

The important nuance: a gateway is **not just a router**. It is a **policy and control
layer**. Routing is the *last* step; everything before it is deciding whether the request
deserves to reach a service at all.

## Why it matters

Without a gateway, every service must re-implement the same cross-cutting work, and every
client must know the address and quirks of every service. A gateway gives you:

- **One entry point** — clients learn a single stable address; internals stay hidden.
- **Shared policies in one place** — auth, validation, and limits are enforced once, at the
  edge, instead of duplicated (and drifting) across services.
- **Simpler frontends** — one API to call, one auth handshake, one error format.
- **Focused services** — business logic stays in services; plumbing stays in the gateway.
- **Early rejection** — bad traffic is stopped at the door, cheaply, before it burns a
  service call.

## Without a gateway vs with a gateway

*(Toggle the comparison above.)*

- **Without** — the frontend talks to every service directly. It must know three (then ten,
  then fifty) addresses; each service duplicates auth, validation, and rate limiting; any
  internal reorganization can break clients.
- **With** — the frontend talks to one gateway. Checks run once at the edge; services are
  hidden behind a stable public API and are free to be split, merged, or rewritten without
  clients noticing.

## The checkpoints — what the gateway can do

Every request runs the same gauntlet *(watch it in the control tower above)*:

1. **Authentication — who are you?** Validate the JWT / API key / session. Fail → **401**.
2. **Authorization — may you do this?** Check roles and scopes against the action. Fail →
   **403**.
3. **Validation — is the request well-formed?** Schema, required fields, types, size caps.
   Fail → **400**.
4. **Rate limit — are you within quota?** Per API key, user, or IP. Fail → **429**.
5. **Routing — who handles this?** Match the path/method and forward to the right service.

On top of the pipeline, gateways commonly handle **protections** (TLS termination, request
size limits, timeouts, IP blocklists, basic bot filtering) and **protocol translation**
(below). The sum of all checks is a simple contract: every request is either **approved and
forwarded** or **rejected with a clear status code** naming the layer that failed.

## Routing to services

The gateway holds a **routing table** and dispatches by path prefix (or method, host,
header):

```
/users/**     →  user-service
/payments/**  →  payment-service
/orders/**    →  order-service
```

Clients never learn internal addresses. Split the order service in two tomorrow, update one
routing rule, and **no client changes at all** — that indirection is what buys internal
freedom.

## Protocol translation — HTTP outside, gRPC inside

Clients speak **HTTP/JSON** because everything (browsers, mobile apps, third parties)
understands it and it's easy to debug. Internally, services often prefer **gRPC**
(HTTP/2 + protobuf): binary, compact, multiplexed, with typed contracts.

The gateway is the **adapter** between the two worlds: it accepts `POST /orders` with a JSON
body and forwards it as a `CreateOrder` gRPC call to the order service — then translates the
reply back to JSON. Each side uses what suits it best, and services can migrate protocols
without any client noticing.

## Trade-offs

A gateway is not free, and **not every system needs one**:

- **Simpler clients vs more infrastructure** — one more component to deploy, monitor, and
  upgrade. A monolith with three routes doesn't need it.
- **Central control vs potential bottleneck** — every request passes through it; it must be
  scaled (multiple stateless instances behind a load balancer) or it becomes the choke point.
- **Consistency vs extra latency** — the extra hop and the checks add a few milliseconds to
  every single request.
- **Failure concentration** — a misconfigured or crashed gateway takes *everything* down.
  Replicate it and keep its config disciplined.
- **The fat-gateway trap** — the gateway should stay a **thin policy layer**. When business
  logic accumulates in it, you've rebuilt a monolith at the front door, owned by no team and
  feared by all.

**Rule of thumb for what goes where:** identity, quotas, schema-shape validation, and routing
belong in the gateway; business rules ("is this item in stock?", "may this user see this
document?") belong in the services.

## Interview relevance

- **When to bring it up** — the moment your design has **more than one backend service** and
  external clients. "Clients hit an API gateway" is the standard opening move of a
  microservices design.
- **What it buys you** — say the list: single entry point, central auth/rate limiting,
  hidden internals, simpler clients, protocol translation.
- **What to centralize vs keep in services** — cross-cutting policy in the gateway; business
  logic in services. Saying this split out loud signals maturity.
- **Call out the risks unprompted** — single point of failure (run replicas), added latency
  (one hop), and the fat-gateway anti-pattern.
- **Know the neighbours** — vs a **load balancer** (distributes traffic, no application
  policy), vs a **reverse proxy** (the gateway *is* one, plus API-level policy), and the
  **BFF** variant (one gateway per client type).

## Class notes

- Default answer: **clients → API gateway (auth, rate limit, validation) → services over
  gRPC**, gateway stateless and replicated behind a load balancer.
- The gateway is a **policy pipeline that ends in routing** — not a router with extras.
- Rejections map to layers: **401** authn, **403** authz, **400** validation, **429** rate
  limit. Naming that mapping in an interview lands well.
- Small system, one service? **Skip the gateway** — say that too; knowing when *not* to use
  a component is part of the answer.
