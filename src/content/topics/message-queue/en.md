---
title: "Message Queue"
slug: message-queue
description: "A buffer that sits between producers and consumers so they can work asynchronously — decoupling systems, absorbing bursts, and surviving each other's failures."
category: blocos-fundamentais
order: 50
difficulty: intermediate
status: published
tags: [messaging, queue, async, decoupling, sqs, infrastructure]
updatedAt: "2026-07-01"
beginnerSummary: >-
  A message queue is a component that sits between the app that produces work (the producer) and
  the app that does the work (the consumer). The producer drops a message in the queue and moves on;
  the consumer picks it up when it's ready. That gap is the whole point: the two sides stop waiting
  on each other, so a burst of traffic gets buffered instead of dropped, and a slow or broken consumer
  no longer drags the producer down. It's about decoupling and stability — not about making a single
  request finish faster.
glossary:
  - term: Producer
    definition: "The application that creates messages and sends them to the queue. It doesn't wait for the work to be done — it just enqueues and moves on."
  - term: Consumer
    definition: "The application that reads messages from the queue and processes them, at its own sustainable rate. Also called a worker or subscriber."
  - term: Queue / Broker
    definition: "The external component that stores messages between producer and consumer. Usually a managed service (e.g. Amazon SQS) that can persist messages for durability."
  - term: Message
    definition: "The unit of data passed through the queue. Often small — an event, a command, or a pointer/metadata referencing a larger payload stored elsewhere."
  - term: Decoupling
    definition: "Producer and consumer don't call each other directly and don't need to be up, fast, or scaled together. The queue is the only thing they share."
  - term: Buffering
    definition: "The queue holds a backlog when messages arrive faster than they're consumed, so bursts are absorbed instead of dropped or overwhelming the consumer."
  - term: Backpressure
    definition: "When consumers can't keep up, work accumulates in the queue (depth grows) rather than crashing the system — a signal to scale out consumers."
  - term: Fan-out
    definition: "One event delivered to multiple independent consumers (e.g. notifications, analytics, search indexing), each processing on its own."
  - term: At-most-once
    definition: "Each message is delivered zero or one time. No duplicates, but a message can be lost. Fine when losing an occasional event is acceptable."
  - term: At-least-once
    definition: "Each message is delivered one or more times — never lost, but possibly duplicated. The common default; consumers must be idempotent."
  - term: Exactly-once
    definition: "Each message is effectively processed once — no loss, no duplicates. The hardest and most expensive guarantee; often achieved with dedup/idempotency on top of at-least-once."
  - term: Idempotency
    definition: "Processing the same message twice produces the same result as processing it once — the practical way to survive at-least-once duplicates."
  - term: Dead-letter queue (DLQ)
    definition: "A separate queue where messages that keep failing (after N retries) are parked, so they don't block the main queue and can be inspected or replayed later."
references:
  - label: "AWS — What is a message queue?"
    url: https://aws.amazon.com/message-queue/
  - label: "Amazon SQS — Developer Guide"
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html
  - label: "AWS SQS — Dead-letter queues"
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html
  - label: "Google Cloud — Message ordering & delivery"
    url: https://cloud.google.com/pubsub/docs/subscription-message-lifecycle
---

> Use the interactive lab above to **watch the system behave**: fire a burst of messages and see the
> queue absorb it, run the image-processing flow, fan one event out to many consumers, and watch a
> failing message retry and land in a dead-letter queue. The notes below are the quick reference.

## What it is

A **message queue** is a component that stores messages temporarily so a **producer** application and
a **consumer** application can work **asynchronously** and independently. The producer sends a message
and moves on; the queue holds it; a consumer picks it up when it's ready.

It's usually **external to your application** — often a **managed cloud service** like **Amazon SQS**
(or RabbitMQ, Google Pub/Sub, etc.). Depending on the technology and the guarantees you pick, the
queue can **persist** messages for durability — it is *not* just an in-memory buffer inside one
process.

## Why it matters

A queue mainly buys you **decoupling, isolation, buffering, asynchronous processing, and
availability**. It lets the two sides scale, deploy, and fail independently, and it smooths out
traffic so a spike doesn't knock anything over.

**What it is *not*:** a way to make a single request finish faster. A queue does not reduce the
latency of one unit of work — if anything it adds a hop. What it improves is **system behavior under
load**: throughput, resilience, and the ability to keep accepting work when a downstream is slow or
down.

## Producer and consumer

- **Producer** — creates messages and **enqueues** them. It doesn't wait for the work to complete.
- **Queue / broker** — organizes and buffers messages, often durably.
- **Consumer** — **retrieves** messages and processes them at its **own sustainable rate**. You can
  run many consumers to drain the queue faster.

## What a message is

A message is just **data**, and it can represent different things: an **event** ("image uploaded"), a
**command** ("send this email"), or a record to process. Keep messages **small**. For large payloads
(images, video, files), don't put the binary on the queue — store it in **object storage** and put a
**pointer/reference plus metadata** in the message.

## Decoupling

Without a queue, the producer calls the consumer **directly** and is now coupled to its availability,
speed, and scale. With a queue, the only thing they share is the queue. The producer doesn't know or
care how many consumers exist, how fast they are, or whether they're momentarily down.

## Asynchronous processing

The producer's job ends at "message enqueued." The actual work happens **later**, independently. This
is what makes the pattern asynchronous — and why it fits background jobs, pipelines, and event-driven
workflows rather than synchronous request/response.

## Buffering & throughput mismatch

Producers and consumers rarely run at the same speed. Say **Server A** receives many uploads per
second but **Server B** can only process **one image per second**. Without a buffer, the extra work is
dropped or crashes B. The queue **absorbs the burst** as a backlog (its **depth** grows), and B drains
it at a **safe, sustainable rate**. When consumers can't keep up, that's **backpressure** — the signal
to add more consumers, not to fall over. *(Fire a burst in the lab to see depth rise and drain.)*

## Fan-out

One producer event can be delivered to **multiple independent consumers** — notifications, analytics,
search indexing — each processing on its own. Add or remove a consumer without touching the producer.

## Image-processing example

- **Server A** receives image uploads; **Server B** compresses images but can do only ~1/sec.
- Server A **uploads the image to object storage** (a bucket).
- Server A **sends a message to the queue** containing a **pointer/metadata** for the image (not the
  binary).
- Server B **reads the message**, **fetches the image from the bucket**, and **compresses** it.

Server A never waits on Server B, bursts are buffered, and B works at its own pace. *(Step through it
in the lab.)*

## Without MQ vs With MQ

**Without a queue,** Server A must call the notification service, the analytics service, and another
downstream **directly**. If notifications are **down**, analytics takes **300 ms**, and the third
takes **50 ms**, then A is coupled to the **slowest and least reliable** dependency — it retries, gets
slow, and may fail.

**With a queue,** A publishes the event **once** and returns. Downstream consumers process
**independently**; one being slow or broken **doesn't block** the producer. That's better **isolation
and availability** — an asynchronous pattern.

## Delivery semantics

How many times might a message be delivered?

- **At-most-once** — zero or one delivery. No duplicates, but messages can be **lost**. Fine when an
  occasional dropped event is acceptable.
- **At-least-once** — one or more deliveries. Never lost, but can be **duplicated**. The common
  default — so consumers must be **idempotent**.
- **Exactly-once** — effectively processed once: no loss, no duplicates. The **hardest and priciest**
  guarantee, usually built as at-least-once **plus deduplication/idempotency**.

## Dead-letter queue (DLQ)

If a message can't be processed successfully — a bug, bad data, a downstream that stays down — the
consumer **retries** a few times. After N failures, the message is routed to a **dead-letter queue**:
a separate queue where "poison" messages are parked so they don't block the main queue. You can then
**inspect, fix, and replay** them, or trigger compensating behavior.

## Trade-offs

- **Better decoupling & resilience** — sides scale and fail independently; bursts are buffered.
- **Async complexity** — you now reason about eventual results, retries, and failure paths.
- **Ordering** — a plain queue with many consumers doesn't guarantee global order; you need ordering
  keys or FIFO queues if order matters.
- **Duplicates** — at-least-once means design for **idempotency**.
- **Eventual consistency** — the result exists *later*, not immediately.
- **Operational overhead** — another system to monitor: queue **depth**, consumer lag, and the DLQ.

## Interview relevance

- **When to introduce one** — the trigger phrases are "**bursty traffic**", "**background/async
  work**", "**decouple**", "**throughput mismatch**", "**fan-out**", or "**a slow/unreliable
  downstream**."
- **Why it absorbs spikes** — the queue buffers a backlog; consumers drain at a safe rate.
- **How it decouples** — producer and consumer share only the queue; neither waits on the other.
- **Fan-out & async workflows** — one event, many independent consumers.
- **Say the honest part** — it does **not** make a single request faster; it improves throughput,
  resilience, and availability.
- **Guarantees & DLQ** — name at-least-once + idempotency, and mention a DLQ for poison messages.

## Class notes

- "Producer fast, consumer slow" → queue. Lead with the throughput-mismatch framing.
- Never put big binaries on the queue — **bucket + pointer**.
- Default mental model: **at-least-once + idempotent consumers + a DLQ**.
- Monitor **queue depth**: rising depth = backpressure = scale out consumers.
