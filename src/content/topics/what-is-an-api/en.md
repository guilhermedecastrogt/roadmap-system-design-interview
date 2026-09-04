---
title: "What is an API?"
slug: what-is-an-api
description: "The contract that lets two systems talk — what an API really is, what travels on the wire, and how REST, webhooks and GraphQL fit around it."
category: blocos-fundamentais
order: 82
difficulty: beginner
status: published
tags: [api, http, contract, integration, architecture]
updatedAt: "2026-09-03"
beginnerSummary: >-
  An API is a contract between two pieces of software: one side promises "call me this way and
  I will answer that way", the other side codes against that promise. A client sends a request
  — an address, a verb, some headers, sometimes a body — and gets back a status code and a
  response. What happens in between (which language, how many servers, which database) is
  deliberately hidden, which is exactly what makes the contract valuable: either side can be
  rebuilt without the other noticing. HTTP and JSON are the common wire format but not the
  definition. On top of that one idea sit three everyday styles: REST, where a client asks for
  resources; GraphQL, where a client asks for exactly the fields it needs; and webhooks, where
  a provider calls you when an event happens. They are not rivals — a single product usually
  offers all three.
glossary:
  - term: API
    definition: "Application Programming Interface — an agreed contract that lets one piece of software use another without knowing how it is built."
  - term: Client and server
    definition: "The caller and the callee of a request. The roles are per-call, not permanent: a server calling another service is a client in that exchange."
  - term: Request
    definition: "What the caller sends: a method, an endpoint, headers, and sometimes a body."
  - term: Response
    definition: "What comes back: a status code, headers, and usually a body in an agreed format."
  - term: Endpoint
    definition: "A specific address the API exposes. With the method, it identifies one operation of the contract."
  - term: Status code
    definition: "A three-digit summary of the outcome. 2xx worked, 4xx the request was wrong, 5xx the server broke."
  - term: Payload / body
    definition: "The data carried by a request or response — commonly JSON, but the format is a choice, not a rule."
  - term: Authentication
    definition: "Proving who is calling, usually with a token or API key. Failing it returns 401."
  - term: Authorization
    definition: "Deciding whether that known caller may do this specific thing. Failing it returns 403."
  - term: Contract
    definition: "The published promise: endpoints, shapes, error formats and guarantees clients may rely on. Changing it without notice is what 'breaking an API' means."
  - term: Public / partner / internal API
    definition: "Who is allowed to call it. The audience decides how much documentation, versioning and defence the API needs."
  - term: API gateway
    definition: "Infrastructure that sits in front of one or more APIs to authenticate, rate-limit and route. It fronts the contract; it is not the contract."
references:
  - label: "MDN — An overview of HTTP"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
  - label: "RFC 9110 — HTTP Semantics"
    url: https://www.rfc-editor.org/rfc/rfc9110.html
  - label: "MDN — HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
  - label: "Google — API design guide"
    url: https://cloud.google.com/apis/design
  - label: "OpenAPI Specification"
    url: https://spec.openapis.org/oas/latest.html
---

> This is the **hub of a four-lesson track**. Use the simulations above to send a request
> through a whole system, take a request and response apart piece by piece, and see who is
> allowed to call an API. Then follow the map to the three ways of using one:
> **[REST](/en/topics/rest-api)**, **[Webhooks](/en/topics/webhooks)** and
> **[GraphQL](/en/topics/graphql)**.

## What it is

An **API** — Application Programming Interface — is a **contract between two pieces of
software**. One side publishes the rules: these are the addresses, this is how you ask, this
is what you get back, this is how errors look. The other side writes code against those rules.

The contract is the point. It says nothing about how the work is done, and that silence is
deliberate: the provider can rewrite the service in another language, split it into ten
services, or swap the database, and as long as the promise holds, **no caller has to change a
line**.

Two things follow from that, and beginners usually miss both:

- An API can expose **data** ("give me user 42") *and* **actions** ("follow this user", "start
  the refund"). It is not just a way to read a table.
- **HTTP and JSON are the common case, not the definition.** An API can speak gRPC over
  HTTP/2, MQTT over TCP, or a binary protocol on a socket, and it is still an API.

## The round trip

*(Run it in the simulation above.)* A call is a trip with stops:

**Client → API → service → database → service → API → client**

1. **The client sends a request** built to the API's rules: address, method, headers, body.
2. **The API checks the caller** — is this a valid token, is the request well formed — before
   any business work starts.
3. **The service applies the rules** — may this caller do this, what should be read or changed.
4. **Storage is read or written.**
5. **The response travels back** as a status code plus a body.

The client only ever sees step 1 and step 5. Everything in between is the provider's business,
and keeping it that way is what makes the contract worth having.

## Anatomy of a call

*(Tap the parts in the inspector above.)*

**The request carries:**

- **Method** — the verb: read, create, replace, remove. Intent, before anything else is read.
- **Endpoint** — the address. Method plus endpoint identify one operation.
- **Headers** — metadata: credentials, content type, tracing ids, caching hints.
- **Body** — the payload, usually JSON. Reads often have none; writes almost always do.

**The response carries:**

- **Status code** — the short answer. `2xx` worked, `4xx` your request was wrong, `5xx` the
  server broke. The two families matter: a `4xx` means *do not retry unchanged*; a `5xx` often
  means *retry later*.
- **Headers** — content type, cache lifetime, rate-limit counters, pagination links.
- **Body** — the data, in the promised shape. Clients parse this, so changing its shape breaks
  people.

## Who is allowed to call it

The same technology serves very different audiences, and the audience — not the code —
decides how much freedom you keep:

- **Public** — anyone who signs up. You cannot change it freely; every breaking change needs a
  version and a migration window.
- **Partner** — a named set of companies. Small audience, high stakes: a break reaches a
  business relationship, not a support queue.
- **Internal** — other teams in your company. Internal is not the same as safe; trusting
  anything on the network is how one compromised service becomes ten.
- **Private / first-party** — your own web and mobile clients. You control both sides and can
  move fast, but old app versions keep calling the old contract for months.

## How REST, webhooks and GraphQL relate

All three sit **on top of** the idea above; they differ in **who starts the conversation** and
**who decides the shape of the answer**:

| | Who starts | Direction | Response shape |
|---|---|---|---|
| **REST** | The client | Client → server | The server's, per endpoint |
| **GraphQL** | The client | Client → server | The client's, field by field |
| **Webhooks** | The provider, after an event | Provider → receiver | An event payload |

The line worth memorizing: **REST and GraphQL are pull, webhooks are push.** And they coexist
happily — a payment provider typically offers a REST API to charge a card, webhooks to tell you
the charge succeeded, and maybe GraphQL for its own dashboard.

Each style gets its own lesson: **[REST](/en/topics/rest-api)** ·
**[Webhooks](/en/topics/webhooks)** · **[GraphQL](/en/topics/graphql)**.

## Where the API gateway fits

An **[API gateway](/en/topics/api-gateway) is not the API.** The gateway is infrastructure
placed *in front of* one or more APIs: it terminates TLS, authenticates, applies rate limits,
and routes to the right service. The API is the promise the client codes against.

Useful way to keep them apart: if you deleted the gateway, the contract would still exist —
you would just have to enforce its rules somewhere else.

## Trade-offs and common concerns

- **Coupling vs stability** — an API decouples teams, but the contract itself becomes a
  commitment. Every field you publish is a field someone will depend on.
- **Chattiness** — one screen assembled from six calls feels slow on a mobile network. The fix
  is design (aggregate, paginate, cache), not blaming the network.
- **Versioning** — the moment somebody else depends on you, you cannot rename a field. Add,
  do not repurpose.
- **Security** — every public endpoint is an entry point: authentication, authorization,
  input validation, quotas, and never trusting anything a client sends.
- **Failure is normal** — timeouts, partial failures, and retries are part of the contract too.
  Say what is retry-safe.
- **Documentation is part of the product** — an undocumented API is a guessing game; machine-
  readable specs (OpenAPI, a GraphQL schema) keep docs and reality together.

## Interview relevance

- **Say what an API is in one sentence** — "a contract between systems": interface, not
  implementation. That framing keeps the rest of the answer clean.
- **Do not conflate API with HTTP** — mention that HTTP/JSON is the common case, then say what
  you would use internally and why.
- **Do not conflate API with API gateway** — the gateway is a component in your diagram, the
  API is the contract at its edge.
- **Name the style deliberately** — "REST for the public API, GraphQL for our own mobile
  client, webhooks to notify partners" is a strong, realistic answer.
- **Bring up the contract's cost** — versioning, deprecation, and backwards compatibility.
  Interviewers notice when a candidate remembers that clients outlive deployments.

## Class notes

- API = **contract**. Client asks, server answers, implementation stays hidden.
- Anatomy: **method, endpoint, headers, body** → **status, headers, body**.
- **4xx** means the request was wrong; **5xx** means the server was. Retry policy follows.
- Audience decides freedom: public and partner APIs are promises, private ones are agreements
  with yourself.
- Three styles on top of one idea — pull with **REST**, pull-with-your-own-shape with
  **GraphQL**, push with **webhooks**.
