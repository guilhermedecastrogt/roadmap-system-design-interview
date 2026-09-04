---
title: "Webhooks"
slug: webhooks
description: "Event-driven HTTP callbacks — how one system notifies another, and everything the receiver must survive: retries, duplicates, forged payloads and dead letters."
category: blocos-fundamentais
order: 86
difficulty: intermediate
status: published
tags: [webhooks, events, integration, idempotency, retry, security]
updatedAt: "2026-09-03"
beginnerSummary: >-
  A webhook flips the direction of a normal API call: instead of your app asking "did anything
  happen?" over and over, the other system calls you the moment something does. You register a
  URL, the provider sends an HTTP POST to it with an event payload, and your app answers 2xx to
  say "got it". That is the easy part. The hard part is everything that can go wrong on a
  network: a delivery can time out, fail, arrive twice, arrive out of order, or be forged by
  anyone who learns your URL. So a real receiver verifies the signature, answers quickly,
  stores the event, does the heavy work asynchronously, and ignores event ids it has already
  processed. No provider promises exactly-once delivery — they promise to keep trying, which
  means your handler must be idempotent.
glossary:
  - term: Webhook
    definition: "An HTTP callback: the provider sends a request to a URL you registered when an event happens on its side."
  - term: Callback URL / endpoint
    definition: "The public address in your system the provider posts to. It is an unauthenticated door strangers can knock on, so it needs verification."
  - term: Event payload
    definition: "The body of the delivery: an event id, a type, a timestamp, and the data describing what happened."
  - term: Event id
    definition: "The unique id of the event — the key you deduplicate on. The same id arriving twice is a repeat, not a second event."
  - term: Signature verification
    definition: "Recomputing an HMAC over the raw body with a shared secret and comparing it in constant time, to prove the sender is who it claims."
  - term: Acknowledgement (ack)
    definition: "The 2xx response telling the provider the event was received. Send it as soon as the event is safely stored, not after the work is done."
  - term: Retry policy
    definition: "How often and for how long a provider retries a failed delivery — typically several attempts with exponential backoff."
  - term: At-least-once delivery
    definition: "The realistic guarantee: an event may arrive more than once, and duplicates are normal, not exceptional."
  - term: Idempotent handler
    definition: "A handler where processing the same event twice has the same effect as processing it once."
  - term: Dead-letter store
    definition: "Where events go after every retry failed, so nothing is silently lost and a human can replay them."
  - term: Polling
    definition: "The alternative: the client asks repeatedly whether anything changed. Simple and firewall-friendly, but wasteful and slower to react."
  - term: Replay attack
    definition: "Re-sending a captured valid delivery. Timestamp checks and freshness windows are what limit it."
references:
  - label: "Stripe — Receive Stripe events in your webhook endpoint"
    url: https://docs.stripe.com/webhooks
  - label: "GitHub — Best practices for using webhooks"
    url: https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks
  - label: "Standard Webhooks — specification"
    url: https://www.standardwebhooks.com/
  - label: "MDN — HTTP request methods (POST)"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
  - label: "AWS — Error retries and exponential backoff"
    url: https://docs.aws.amazon.com/general/latest/gr/api-retries.html
---

> Lesson 3 of the API track — the one where the client stops asking. Use the simulator above to
> fire an event and force each failure: a timeout, a 500, a forged signature, a duplicate. Then
> switch off the receiver guards one by one and read what each was protecting you from.

## What a webhook is

A **webhook** is an HTTP callback. You register a URL with a provider; when something happens on
their side, they send a `POST` to your URL with an event payload. It is still HTTP — but the
**communication model is inverted**: nobody asked, and the provider is the client for this call.

```
Event happens at the provider
  → provider builds the event payload
  → provider signs it and POSTs to your callback URL
  → your app verifies the signature
  → your app answers 2xx immediately
  → your app processes the event asynchronously
```

The canonical example: a payment provider sends `payment.succeeded` to a shop, and the shop
releases the order.

## Polling vs webhooks

*(Run both clocks above.)* Polling means asking "anything new?" on a schedule. Over a minute
with a 10-second interval you make six calls, five of which find nothing, and you still learn
about the event up to ten seconds late. The webhook makes one call, at the moment it matters.

Polling is not wrong — it is simple, needs no public endpoint, and works from behind firewalls
that block inbound traffic. It is just expensive when events are rare and you want to react
quickly. The rule of thumb: **push when the provider knows first, poll when you cannot accept
an inbound call.**

## What a delivery carries

```
POST /webhooks/provider
X-Event-Id: evt_8f21c0
X-Event-Type: payment.succeeded
X-Timestamp: 1772806927
X-Signature: sha256=4f2a9c7e1b…
X-Delivery-Attempt: 1

{ "id": "evt_8f21c0", "type": "payment.succeeded", "data": { … } }
```

Four fields matter more than the rest:

- **Event id** — your deduplication key.
- **Event type** — what happened, so you can route it.
- **Timestamp** — lets you reject deliveries that are too old (replay protection).
- **Signature** — an HMAC over the raw body with a shared secret. Compare it in constant time,
  and compute it over the **raw bytes**, before any JSON parsing reformats them.

## Retries, duplicates and idempotency

A delivery is a network call, so it can fail in the usual ways — and one of them is nasty:
**a timeout does not tell the provider whether you processed the event.** Not knowing, it
retries. That is the whole reason duplicates exist.

- Providers retry with **exponential backoff** over minutes or hours.
- The realistic guarantee is **at-least-once**. Nobody promises exactly-once — over an unreliable
  network, it cannot be promised end to end.
- Therefore your handler must be **idempotent**: store processed event ids and drop repeats
  before they reach business logic. Two deliveries, one shipment.
- **Order is not guaranteed** either. A retried `created` can land after `updated`. Use the
  event timestamp or a version field and ignore anything older than what you already applied.

When every attempt fails, a good provider parks the event in a **dead-letter store** and shows
it in a dashboard. Nothing was lost — but nothing was processed either, so someone has to
replay it.

## Building a receiver that survives

*(Toggle each guard above.)*

1. **Verify the signature** — otherwise anyone who learns your URL can forge `payment.succeeded`.
2. **Answer 2xx quickly** — acknowledge as soon as the event is safely stored, well under the
   provider's timeout. Slow answers look like failures and trigger retries.
3. **Do the work asynchronously** — persist, enqueue, and let a worker handle the expensive
   part. Otherwise a slow third-party call turns into a retry storm.
4. **Deduplicate by event id** — the single line of code that prevents double refunds.
5. **Do not assume order** — reconcile with timestamps or versions.

Two more that pay off in production: **log every delivery** (id, type, attempt, response) so you
can answer "did we get it?", and **expose a replay endpoint** so support can reprocess a stored
event without begging the provider.

## Webhooks, APIs and queues

They all move messages, and mixing them up is a classic interview stumble:

- A **request/response API** is you asking and holding the answer. You choose the moment.
- A **webhook** is someone else's system calling yours because something happened there.
- A **[message queue](/en/topics/message-queue)** is durable infrastructure *you own*, giving
  buffering, ordering guarantees, replay and back-pressure inside your system.

The common production shape uses two of them together: the webhook endpoint only verifies and
enqueues; the queue and its workers do the real work and own the retries.

## Trade-offs

- **Fast and cheap, but not guaranteed on the first try.** You trade polling cost for delivery
  complexity.
- **You must expose a public endpoint** — one more attack surface, and impossible in some
  networks.
- **The provider controls the payload and the retry policy.** You inherit their choices.
- **Debugging is asynchronous.** Without delivery logs on both sides, "we never got it" is
  unfalsifiable.
- **Thin payloads vs fat payloads.** Sending only ids forces a callback to fetch the data (an
  extra request, but always fresh and no sensitive data in transit); sending the whole object is
  faster but can arrive stale and leaks more if intercepted.

## Interview relevance

- **Say the direction out loud** — "the provider calls us, so this is push, not polling".
- **Bring up idempotency and duplicates before being asked.** It is the single strongest signal
  that you have run webhooks in production.
- **Never promise exactly-once.** Say at-least-once plus an idempotent handler — that is the
  correct answer.
- **Describe the fast-ack pattern** — verify, store, 2xx, process asynchronously.
- **Mention security concretely** — signature over the raw body, constant-time compare,
  timestamp freshness window, HTTPS only.
- **Know when not to use them** — if you cannot accept inbound calls, or you need strict
  ordering and replay, a queue or a polled feed API may fit better.

## Class notes

- Webhook = **the provider calls you** when an event happens. Push, not pull.
- Delivery carries **event id, type, timestamp, signature** — verify before trusting anything.
- **At-least-once** is the real guarantee: retries and duplicates are normal.
- Receiver recipe: **verify → store → 2xx fast → process async → dedupe by event id**.
- After the last retry, events land in a **dead-letter store**; someone must replay them.
