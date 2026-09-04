---
title: "REST API"
slug: rest-api
description: "Resource-oriented APIs over HTTP — methods and what they promise, status codes, pagination, versioning, and the trade-offs REST asks you to accept."
category: blocos-fundamentais
order: 84
difficulty: intermediate
status: published
tags: [rest, api, http, idempotency, pagination, versioning]
updatedAt: "2026-09-03"
beginnerSummary: >-
  REST is the most common way to design an API over HTTP: model the domain as resources —
  nouns like tweets and users — give each one an address, and use HTTP methods as the verbs.
  GET reads, POST creates, PUT replaces, PATCH changes part, DELETE removes. Each method
  carries a promise clients rely on: GET changes nothing (safe), and GET, PUT and DELETE land
  in the same state if repeated (idempotent), which is what makes a retry after a timeout
  survivable. The status code tells the caller whose fault an outcome was: 2xx worked, 4xx the
  request was wrong, 5xx the server broke. Around that core sit the boring essentials that
  decide whether an API is pleasant a year later: pagination, filtering, versioning, auth and
  rate limits. REST is a style, not a protocol — nothing enforces consistency but your team.
glossary:
  - term: REST
    definition: "An architectural style for networked applications: resources with addresses, a uniform interface (HTTP methods), and stateless requests. Not a protocol and not a specification."
  - term: Resource
    definition: "A domain noun the API exposes — a tweet, a user, a follow relationship. Endpoints are addresses of resources, not names of functions."
  - term: Endpoint
    definition: "A path the API serves, such as /v1/tweets/{id}. Method plus path identify one operation."
  - term: Safe method
    definition: "A method that changes nothing on the server. GET and HEAD are safe: any number of calls leave the system untouched."
  - term: Idempotent method
    definition: "A method where repeating the same call lands in the same final state. GET, PUT and DELETE are idempotent; POST and a typical PATCH are not."
  - term: Idempotency key
    definition: "A client-generated id sent with a write so the server can recognize a retry and return the first result instead of doing the work twice."
  - term: Statelessness
    definition: "Each request carries everything needed to serve it; the server keeps no per-client session between calls. That is what lets any instance answer any request."
  - term: Offset pagination
    definition: "Paging with page and limit. Simple and allows jumping to any page, but drifts when items are inserted and gets expensive deep in the list."
  - term: Cursor pagination
    definition: "Paging with an opaque pointer to the last item read. Stable under inserts and cheap at any depth, but no jumping to an arbitrary page."
  - term: Filtering
    definition: "Narrowing a collection with query parameters, e.g. ?authorId=u_42. Filters belong in the query string, not in new endpoints per combination."
  - term: Versioning
    definition: "Offering a new contract without breaking the old one — in the path (/v2), in a header, or in a query parameter."
  - term: Rate limiting
    definition: "Capping calls per client per window; excess is rejected with 429 and, ideally, a Retry-After header."
  - term: 401 vs 403
    definition: "401 means the API does not know who you are; 403 means it knows and still refuses. Logging in fixes the first, not the second."
references:
  - label: "Roy Fielding — Architectural Styles (chapter 5, REST)"
    url: https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
  - label: "MDN — HTTP request methods"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
  - label: "Microsoft — RESTful web API design"
    url: https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
  - label: "Google — API design guide"
    url: https://cloud.google.com/apis/design
  - label: "Stripe — Idempotent requests"
    url: https://docs.stripe.com/api/idempotent_requests
---

> Lesson 2 of the API track — start at **[What is an API?](/en/topics/what-is-an-api)** if you
> have not. Use the playground above to send calls and force each failure: notice that every
> status code is produced at a **different depth of the system**. Then read the resource map
> and build a paginated URL.

## What REST is

REST models a system as **resources** — the nouns of the domain — each with an address, all
manipulated through the same small set of HTTP methods. `POST /v1/tweets` creates a tweet;
`GET /v1/tweets/t_901` reads one; `DELETE` removes it.

Two properties do most of the work:

- **Uniform interface.** Any developer who knows HTTP already knows how to call your API. That
  familiarity is why REST remains the default for public APIs.
- **Stateless requests.** Every call carries everything needed to serve it, so any instance can
  answer any request. That is what makes horizontal scaling and load balancing trivial.

REST is an **architectural style, not a protocol**. There is no compiler checking that your
endpoints are consistent — which is exactly why every large API publishes design guidelines.

## Resources and endpoints

Model nouns, not functions. `POST /v1/users/u_42/follow` is fine — it acts on a relationship
resource. `POST /v1/doUserFollowAction` is an RPC call wearing a REST costume.

```
GET    /v1/tweets              a page of tweets
GET    /v1/tweets/{id}         one tweet
POST   /v1/tweets              create a tweet
PATCH  /v1/tweets/{id}         change some fields
DELETE /v1/tweets/{id}         remove it
GET    /v1/users/{id}/tweets   that user's tweets
```

Nest only to express ownership, and stop early: `/v1/users/{id}/tweets/{tweetId}/replies/{replyId}`
is a path nobody wants to route, cache or debug.

## What each method promises

*(The resource map above marks these two columns per endpoint.)*

- **Safe** — the call changes nothing. `GET` is safe: a crawler can hit it a thousand times.
- **Idempotent** — repeating the call lands in the same final state. `GET`, `PUT` and `DELETE`
  are; `POST` is not, and a `PATCH` that says "increment likes" is not either.

This is not trivia. When a client times out it does not know whether the request arrived, and
its only options are "retry" or "give up". Idempotency is what makes retry safe.

**PUT and PATCH are not the same thing.** `PUT` replaces the resource with what you sent —
fields you omit are gone, and that is the contract, not a bug. `PATCH` applies a partial
change. For writes that must survive retries, add an **idempotency key**: the client sends a
unique id with the request, the server stores it, and a repeat returns the first result instead
of creating a second charge.

## Status codes and where failures come from

The status code is the API saying whose fault it was — and, usefully, **how deep the request
got**:

| Code | Meaning | Produced by |
|---|---|---|
| `200` / `201` / `204` | Worked (read / created / nothing to say) | The service, after doing the work |
| `400` | The request itself is malformed | Validation, before business logic |
| `401` | We do not know who you are | The edge, before anything runs |
| `403` | We know you, and no | Authorization, inside the service |
| `404` | Endpoint exists, resource does not | After a storage lookup |
| `429` | Too many calls | Rate limiting at the edge |
| `500` | We broke | Anywhere behind the contract |

The client-facing rule: **`4xx` means do not retry unchanged; `5xx` (and `429`) mean retry
later, with backoff.** A client that only checks "did it return JSON" will treat a `403` as
data and quietly do the wrong thing.

## Pagination, filtering, versioning

*(Build the URL in the collection playground above.)*

- **Never return an unbounded collection.** Always paginate, always cap the page size on the
  server. `?limit=10000` will be tried.
- **Offset paging** (`?page=3&limit=20`) is easy and lets you jump anywhere, but items shift as
  new ones are inserted — readers see duplicates and gaps — and deep pages get expensive.
- **Cursor paging** (`?cursor=t_899`) hands back an opaque pointer to where you stopped: stable
  under inserts, cheap at any depth, but no jumping to page 40. Feeds use cursors.
- **Filtering and sorting belong in the query string** (`?authorId=u_42&sort=-createdAt`), not
  in a new endpoint per combination.
- **Versioning** offers a new contract without breaking the old one: in the path (`/v2/tweets`,
  obvious and easy to route), in a header (`Accept: application/vnd.tweets.v2+json`, keeps URLs
  stable but invisible in a browser), or in a query parameter (quick, but mixes contract
  selection with filtering).

The cheapest version is the one you never publish: **add fields instead of renaming them**, and
never repurpose the meaning of an existing field.

## Security and quotas

- **Authenticate at the edge** — a token per request, validated before business logic runs.
- **Authorize in the service** — "may this user modify this tweet" is a business rule and needs
  the resource in hand.
- **Validate everything** — types, lengths, ranges, and the size of the body itself.
- **Rate limit per client**, return `429` with `Retry-After`, and publish the limits. See
  **[Rate limiting](/en/topics/rate-limiting-throttling)**.
- **Never leak internals in errors** — a trace id is helpful; a stack trace is a gift to an
  attacker.

## Trade-offs

- **One shape for every client.** The endpoint returns what the server decided, so a mobile
  card downloads fields it will not render — *overfetching*.
- **Multiple round trips for rich screens.** A list plus one call per author is *underfetching*,
  and on a mobile network it is felt. (This is exactly the pain
  **[GraphQL](/en/topics/graphql)** targets — and a purpose-built endpoint for that screen
  solves it in REST too.)
- **Versioning needs discipline.** Once published, a contract is a commitment.
- **Consistency is manual.** Nothing stops two teams from inventing two error formats. Write
  guidelines, review them, and generate an OpenAPI spec.

None of this makes REST outdated. For public APIs, resource CRUD and cacheable reads, it is
still the sane default — mature tooling, easy debugging, and HTTP caching that works for free.

## Interview relevance

- **Say "architectural style", not "protocol".** Then design resources out loud: nouns,
  addresses, methods.
- **Bring up idempotency unprompted** when the design includes payments, orders or anything
  retried. Mention idempotency keys for `POST`.
- **Map failures to layers** — 401 at the edge, 403 in the service, 404 after storage, 429 at
  the limiter. It shows you think about where code runs.
- **Always paginate** and say which strategy: cursors for feeds, offsets for admin tables.
- **Compare fairly.** "REST for the public API; GraphQL where many screens need different
  shapes" beats declaring a winner.

## Class notes

- Resources are nouns; methods are verbs; status codes are the verdict.
- **Safe** = changes nothing. **Idempotent** = repeating is harmless. Retries depend on both.
- `PUT` replaces, `PATCH` patches, `POST` creates — and `POST` needs an idempotency key to be
  retry-safe.
- Paginate always; cursor for feeds, offset for jumpable tables.
- Version by adding, not renaming. The contract outlives the code.
