---
title: "gRPC"
slug: grpc
description: "Typed remote procedure calls over HTTP/2 — one .proto contract generating both sides, four streaming modes, binary payloads, deadlines, and where it belongs relative to REST."
category: blocos-fundamentais
order: 89
difficulty: intermediate
status: published
tags: [grpc, protobuf, http2, rpc, microservices, streaming]
updatedAt: "2026-09-04"
beginnerSummary: >-
  gRPC makes calling another service look like calling a function. You describe the service in
  a .proto file — the methods, their inputs, their outputs — and a compiler generates a client
  stub and a server interface from it, in whichever languages you use. The call then travels
  over HTTP/2 as a compact binary message instead of JSON text, on a connection that stays open
  and carries many calls at once. That connection also unlocks streaming in four shapes:
  one-to-one, server streaming, client streaming, and both sides at once. The price is that
  gRPC is not made for browsers or for strangers: the payload is unreadable without the .proto,
  every build needs a code-generation step, and a browser needs gRPC-Web or a gateway
  translating HTTP/JSON into gRPC. The usual answer is not "gRPC or REST" — it is REST at the
  edge, gRPC between your own services.
glossary:
  - term: gRPC
    definition: "A remote procedure call framework: methods declared in a contract, generated clients and servers, and calls carried over HTTP/2 with binary payloads."
  - term: RPC (remote procedure call)
    definition: "Calling a function that runs on another machine. The style names an action (GetUser) where REST names a resource (/users/42)."
  - term: Protocol Buffers (protobuf)
    definition: "The interface definition language and binary serialization format gRPC uses by default. Compact, typed, and unreadable without the schema."
  - term: .proto file
    definition: "The contract: services, methods, messages, and a number for every field. It is the single source both sides are generated from."
  - term: Field number
    definition: "The integer after `=` in a message field. It — not the field name — is what travels on the wire, which is why numbers can never be reused."
  - term: Stub
    definition: "The generated client object whose methods look local but perform a network call underneath."
  - term: HTTP/2 multiplexing
    definition: "Many independent streams sharing one TCP connection, without blocking each other. It is what lets gRPC keep one connection and stream on it."
  - term: Unary call
    definition: "One request, one response — the familiar request/response shape."
  - term: Server streaming
    definition: "One request, many responses over the same stream, over time."
  - term: Client streaming
    definition: "Many requests from the caller, one response at the end."
  - term: Bidirectional streaming
    definition: "Both sides send messages independently on one connection, in any order."
  - term: Deadline
    definition: "The point in time after which the caller stops waiting. gRPC propagates it down the call chain so a whole tree of calls can give up together."
  - term: gRPC status code
    definition: "gRPC's own codes, not HTTP's: OK (0), DEADLINE_EXCEEDED (4), NOT_FOUND (5), PERMISSION_DENIED (7), UNAVAILABLE (14), UNAUTHENTICATED (16)."
  - term: gRPC-Web
    definition: "A browser-compatible variant that speaks a different framing and needs a proxy, because browsers cannot control raw HTTP/2 frames."
  - term: Interceptor
    definition: "Middleware for gRPC calls — auth, logging, tracing, retries — applied on the client or the server side."
references:
  - label: "gRPC — Introduction to gRPC"
    url: https://grpc.io/docs/what-is-grpc/introduction/
  - label: "gRPC — Core concepts, architecture and lifecycle"
    url: https://grpc.io/docs/what-is-grpc/core-concepts/
  - label: "gRPC — Status codes and their use"
    url: https://grpc.io/docs/guides/status-codes/
  - label: "Protocol Buffers — Language guide (proto 3)"
    url: https://protobuf.dev/programming-guides/proto3/
  - label: "gRPC — Deadlines"
    url: https://grpc.io/docs/guides/deadlines/
  - label: "gRPC-Web — Basics tutorial"
    url: https://grpc.io/docs/platforms/web/basics/
---

> Lesson 5 of the API track, and the one about traffic your users never see. Start at
> **[What is an API?](/en/topics/what-is-an-api)** for the shared map. Above: compile one
> `.proto` into both sides and call it, play the four streaming modes, watch the payload shrink
> to binary, and place gRPC next to **[REST](/en/topics/rest-api)** at the edge.

## What gRPC is

gRPC is a **remote procedure call** framework. Where REST asks you to think in resources
(`GET /v1/users/42`), gRPC asks you to think in **methods** (`GetUser(id: 42)`) — and then
generates the code that makes that call look local:

```protobuf
service Users {
  rpc GetUser (GetUserRequest) returns (User);
}
```

```ts
const user = await client.getUser({ id: 42 });
```

Three technical choices define it:

- **A contract in a `.proto` file**, compiled into a client stub and a server interface, in
  every language you support.
- **Protocol Buffers on the wire** — typed, binary, compact.
- **HTTP/2 as transport** — one long-lived connection carrying many multiplexed streams, which
  is what makes streaming possible at all.

## The contract comes first

The `.proto` file is not documentation that drifts — it is the **source both sides are
generated from**. Change a field and the callers stop compiling; that failure happens on your
machine instead of at 3 a.m. in production.

That is the real difference from a hand-written REST client. In REST, the contract lives in
docs, an OpenAPI file, and a client someone wrote by hand — three things that can disagree. In
gRPC there is one artifact, and disagreement is a build error.

The cost is a **code-generation step** in every build, for every language, plus the discipline
that comes with it: field numbers are permanent, and a `.proto` change must land before the
code that depends on it.

## Four kinds of call

*(Play them above.)* Because HTTP/2 multiplexes streams, gRPC offers more than request/response:

| Mode | Signature | Use it for |
|---|---|---|
| **Unary** | `rpc GetUser (Req) returns (User)` | Ordinary reads and writes |
| **Server streaming** | `returns (stream User)` | Live updates, tailing, large results in chunks |
| **Client streaming** | `(stream User) returns (Summary)` | Bulk upload, metrics, batch import |
| **Bidirectional** | `(stream User) returns (stream User)` | Chat, real-time sync, long-lived coordination |

This is the capability REST does not have out of the box — and the reason gRPC requires HTTP/2,
which is also why it does not run natively in a browser.

## Why the payload is small — and unreadable

JSON sends `{"id":42,"name":"Ada Lovelace"}`: field **names**, as text, on every message.
Protobuf sends the **field number** plus a binary value — `name` never travels, only `2` does.

Two consequences, and they are the same fact seen from two sides:

- **It is small and fast to parse.** For chatty internal traffic measured in millions of calls,
  that is real money and real latency.
- **You cannot read it without the `.proto`.** `curl` and browser devtools stop helping, and you
  need `grpcurl` plus the schema (or server reflection) to inspect a call.

It also dictates the schema rules:

- **Adding a field** with a new number is safe — old readers ignore what they do not know.
- **Renaming a field** is safe on the wire (names are not sent); it only breaks compilation.
- **Changing a field's number** breaks peers *silently* — old code will read the new field as the
  old one.
- **Deleting a field** means marking the number `reserved`. Reusing a retired number is the same
  silent corruption.

## Status codes, deadlines and retries

gRPC has **its own status codes**, not HTTP's: `OK (0)`, `DEADLINE_EXCEEDED (4)`,
`NOT_FOUND (5)`, `PERMISSION_DENIED (7)`, `UNAVAILABLE (14)`, `UNAUTHENTICATED (16)`. The
familiar 401/403 distinction survives, renamed: `UNAUTHENTICATED` means we do not know you;
`PERMISSION_DENIED` means we know you and still refuse.

**Every call should carry a deadline.** Not a timeout invented per client, but a deadline
propagated down the chain: if the caller has 300 ms left, everything it calls inherits what
remains, and the whole tree can stop instead of doing work nobody will read. Without deadlines,
one slow dependency quietly exhausts thread pools three services upstream.

And the same rule as everywhere else applies: `DEADLINE_EXCEEDED` **does not mean the work did
not happen** — only that you stopped waiting. Retry only what is idempotent, and prefer
`UNAVAILABLE` (a connection failure) as the retryable case, with backoff.

## Where it fits

- **At the edge**, facing browsers, mobile apps and third parties: HTTP/JSON. Everyone speaks
  it, anyone can debug it, and nobody needs your `.proto`.
- **Inside**, between services you own: gRPC. Callers are machines you control, calls are
  frequent and latency-sensitive, and typed contracts pay for themselves.

The bridge between the two is an **[API gateway](/en/topics/api-gateway)** doing protocol
translation — HTTP/JSON at the door, gRPC behind it — or gRPC-Web plus a proxy when a browser
must call gRPC directly.

One operational detail worth knowing: because gRPC keeps **long-lived HTTP/2 connections**, a
plain L4 load balancer will pin a client to one backend and leave your replicas idle. You need
an L7 balancer that understands HTTP/2, client-side load balancing, or a service mesh. See
**[Load balancer](/en/topics/load-balancer)**.

## Trade-offs

- **Typed contracts vs a build step.** Codegen in every language, in every pipeline.
- **Small and fast vs opaque.** No curl, no devtools, no eyeballing a payload in a log.
- **Streaming vs operational complexity.** Long-lived streams need care in balancing,
  reconnection and back-pressure.
- **Great inside, awkward outside.** Public consumers expect REST; asking a partner to install a
  toolchain to send one request is a hard sell.
- **Not browser-native.** gRPC-Web plus a proxy, or translation at the gateway.

## gRPC vs REST vs GraphQL

*(The comparison table above holds all four styles side by side.)*

- **REST** — resources over HTTP, the default at the edge, cacheable and universally understood.
- **GraphQL** — the client picks the fields; strongest for rich UIs pulling nested data.
- **gRPC** — typed methods between services; strongest where calls are internal, frequent, and
  latency-sensitive.
- **[Webhooks](/en/topics/webhooks)** — orthogonal to all three: the provider pushes an event,
  and you can use webhooks alongside any of them.

A very ordinary architecture uses every one: REST at the edge, gRPC inside, GraphQL for the
first-party app, and webhooks to notify partners.

## Interview relevance

- **Say "RPC" and mean it** — methods, not resources. Then name the three pillars: `.proto`
  contract, protobuf binary, HTTP/2 transport.
- **Bring up deadlines yourself.** Deadline propagation is a strong, specific signal.
- **Know the status codes** at least roughly, and the `UNAUTHENTICATED` / `PERMISSION_DENIED`
  split.
- **Mention the browser limitation** before the interviewer does — gRPC-Web or gateway
  translation.
- **Mention L7 load balancing** for long-lived HTTP/2 connections. Very few candidates do.
- **Do not oversell.** "gRPC internally, REST at the edge" is the answer that sounds like
  production experience.

## Class notes

- gRPC = **one `.proto` → generated client and server**, binary over HTTP/2.
- **Four call shapes**: unary, server streaming, client streaming, bidirectional.
- The wire carries **field numbers, not names** — hence small payloads and permanent numbers.
- Its **own status codes**, plus deadlines propagated down the call chain.
- **Not browser-native**: gRPC-Web with a proxy, or an API gateway translating at the edge.
- Long-lived HTTP/2 connections need **L7 balancing** or client-side load balancing.
