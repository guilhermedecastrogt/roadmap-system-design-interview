---
title: "CAP Theorem"
slug: cap-theorem
description: "Why a distributed system cannot fully guarantee consistency and availability during a network partition — and how AP, CP, and CA trade-offs shape real architectures."
category: blocos-fundamentais
order: 70
difficulty: intermediate
status: published
tags: [cap-theorem, distributed-systems, consistency, availability, partition-tolerance, replication, trade-offs]
updatedAt: "2026-07-17"
beginnerSummary: >-
  CAP Theorem is about what happens when the network between the machines of a distributed
  system breaks (a partition). Consistency means every read returns the most recent
  successful write, no matter which replica answers. Availability means every request gets a
  response, even if it might not be the freshest data. Partition tolerance means the system
  keeps operating while nodes cannot talk to each other. During a partition you cannot fully
  have both consistency and availability: a replica that cannot check with the others must
  either answer anyway (risking stale data — the AP stance) or refuse to answer (sacrificing
  availability — the CP stance). Because real networks do fail, distributed systems must
  tolerate partitions, so the practical choice is usually AP vs CP — and good architectures
  choose per data type: social feeds lean AP, bank balances lean CP. CA (both guarantees,
  no partition tolerance) only makes sense when partitions are out of the picture, like a
  single-node database.
glossary:
  - term: Consistency (in CAP)
    definition: "Every client sees the most recent successful write, no matter which replica answers. Not correctness in general — specifically the absence of stale reads."
  - term: Availability (in CAP)
    definition: "Every request receives a non-error response — even if it may not contain the latest write. It is about answering, not about being up to date."
  - term: Partition tolerance
    definition: "The system keeps operating even when nodes cannot communicate because the network between them failed. Nodes are alive; messages are lost."
  - term: Network partition
    definition: "A network failure that splits a cluster into groups of nodes that cannot reach each other, while each group keeps running."
  - term: Replica
    definition: "A copy of the same data kept on another node, so the system survives failures and can serve reads closer to users."
  - term: Stale read
    definition: "A read that returns an older value because the answering replica has not yet received the latest write."
  - term: AP system
    definition: "During a partition, keeps answering every request at the cost of possibly serving stale data. Replicas diverge and reconcile later."
  - term: CP system
    definition: "During a partition, rejects or delays requests it cannot safely coordinate, so clients never see stale data — at the cost of availability."
  - term: CA system
    definition: "Consistent and available only while no partition exists. Meaningful when partition tolerance is not required (e.g. a single node); not a practical stance for most distributed systems."
  - term: Split brain
    definition: "A failure where both sides of a partition believe they are in charge and accept conflicting writes — the disaster CP coordination systems exist to prevent."
  - term: Eventual consistency
    definition: "Replicas may temporarily disagree but converge once replication catches up — the usual consistency model of AP systems."
  - term: Quorum
    definition: "Requiring a majority of replicas to acknowledge a read or write, so two disagreeing majorities cannot exist — a common CP building block."
references:
  - label: "Eric Brewer — CAP Twelve Years Later: How the Rules Have Changed"
    url: https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/
  - label: "Gilbert & Lynch — Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"
    url: https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf
  - label: "Martin Kleppmann — Please stop calling databases CP or AP"
    url: https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html
  - label: "Designing Data-Intensive Applications (Kleppmann)"
    url: https://dataintensive.net/
  - label: "Jepsen — Consistency Models"
    url: https://jepsen.io/consistency
---

> Use the lab above to **feel the theorem instead of memorizing it**: tap the triangle to
> learn what C, A, and P really promise, then cut the network between replicas A and B,
> withdraw money on one side, read the balance on the other — and watch AP, CP, and CA
> answer the same requests differently. The notes below are the quick reference.

## What it is

CAP Theorem describes a trade-off in **distributed systems** — systems where the same data
lives on more than one node. It says that when a **network partition** happens, a system
cannot fully guarantee both:

- **C — Consistency**: every read sees the most recent successful write, whichever replica
  answers.
- **A — Availability**: every request gets a (non-error) response, even if it may not
  contain the latest data.

while also being **P — Partition tolerant**: continuing to operate while nodes cannot talk
to each other.

## Why it matters

Every replicated system — multi-region databases, caches, queues, coordination services —
eventually faces a partition, because **real networks fail**: cables get cut, routers
misbehave, a whole availability zone drops off. CAP forces the question every architect must
answer in advance: *when that happens, does this data keep answering (and risk being stale),
or stay strictly fresh (and reject some requests)?*

## The three parts

- **Consistency** — all clients see the latest successful write, regardless of which
  replica they hit. It is *not* "the data is correct" in a general sense; it is
  specifically: **no stale reads**.
- **Availability** — every request receives a response. It is *not* "the response is
  correct/latest"; it is specifically: **no refused requests**.
- **Partition tolerance** — the system keeps operating when the network between nodes
  fails. The nodes are healthy; the **messages between them are lost**.

## What a partition is

A partition is a **network split**, not a crash. Replica A and replica B are both up and
serving, but the link between them is down: writes accepted on one side **cannot reach** the
other. Each side must now decide alone whether it can still answer safely.

## The balance example

Two replicas hold your account balance of **$1000** *(this is the lab above)*:

1. You **withdraw $100**; the write lands on **replica A** → A now says **$900**.
2. Right after, your **read lands on replica B**.
3. If the system is **consistent**, B must answer **$900**. If B answers **$1000**, that is
   a **stale read** — and with money, stale reads invite double-spending.

While the network is healthy, replication keeps B in sync and this is easy. During a
partition, A's write cannot reach B — and now the system must choose.

## Why you can't have all three (during a partition)

With the link down, replica B receives a read and has exactly two options:

- **Answer anyway** with the data it has → the system stayed **available**, but may have
  served a stale value → consistency sacrificed → **AP**.
- **Refuse or wait** because it cannot verify it has the latest write → no stale read, but
  the request got no useful answer → availability sacrificed → **CP**.

There is no third option for B: it *cannot check with A*, because that is what a partition
means. That is the theorem — not a slogan about "picking 2 of 3 forever", but a forced
choice **while a partition holds**.

## AP — availability + partition tolerance

- The system **keeps responding on both sides** of the split.
- Writes commit locally; replicas **diverge temporarily** and reconcile after the heal
  (eventual consistency).
- Reads may return **stale data** — acceptable for likes, feeds, view counters, carts,
  presence.
- Examples: Cassandra, DynamoDB's default reads, DNS, most caches.

## CP — consistency + partition tolerance

- The system **rejects or delays** requests it cannot safely coordinate during the split
  (often: the minority side stops answering).
- Clients get **fresh data or an error** — never a silently wrong value.
- The price is availability and latency — acceptable for balances, inventory at checkout,
  leader election, cluster configuration.
- Examples: ZooKeeper, etcd, Google Spanner, relational setups with synchronous replication.

## CA — consistency + availability

- Both guarantees hold **only while the network never partitions** — CA has no plan for a
  split.
- It is meaningful when partition tolerance is genuinely not required: a **single-node
  database**, or tightly coupled systems where a partition means total failure anyway.
- In a real distributed system a partition eventually happens, and at that moment a "CA"
  design is forced to give up C or A on the spot. **Do not present CA as the normal choice
  for distributed systems.**

## Trade-offs by use case

- **Social feeds, likes, timelines** → AP: a briefly wrong count is invisible; an error
  page is not.
- **Bank balances, transfers, checkout stock** → CP: a stale answer is worse than a
  rejected request.
- **Shopping carts, chat presence** → AP: losing freshness for seconds is cheap.
- **Leader election, distributed locks, cluster config** → CP: split brain corrupts data.

The same product uses both stances at once — browsing leans AP while payment leans CP.
**Choose per data type, not per application.**

## Real-world intuition

- Partitions are **rare but certain** — design for them like you design for disk failure.
- Outside partitions, the same tension appears as **consistency vs latency**: stronger
  guarantees mean more coordination on every write (this refinement is known as PACELC).
- Real databases are **tunable**, not permanently "AP" or "CP": quorum settings, read
  preferences, and sync vs async replication move you along the spectrum per operation.

## Interview relevance

- **Explain it in one breath**: "When replicas can't talk to each other, a request hits a
  replica that can't verify it has the latest data — it either answers anyway (AP, maybe
  stale) or refuses (CP, unavailable)."
- **Define C and A precisely** — consistency = every read sees the latest successful write;
  availability = every request gets a response. Sloppy definitions are the most common CAP
  mistake.
- **Say why P is non-negotiable** — networks fail, so distributed systems must tolerate
  partitions; the real decision is AP vs CP *during* the partition.
- **Argue with data types**: stale likes are fine (AP), stale balances are dangerous (CP).
  Naming *where stale reads are acceptable* is exactly what interviewers probe.
- **Flag the CA trap** — mention that CA only makes sense without partition tolerance
  (single node); calling a distributed system "CA" signals a misunderstanding.

## Class notes

- The forced choice happens **only while a partition holds** — the rest of the time you are
  tuning consistency vs latency, not C vs A.
- The balance demo is the whole theorem: **write to A, read from B, link down** — B either
  lies (AP) or refuses (CP).
- Kill the slogan "pick any two": P is not optional in distributed systems, so the menu is
  really **AP or CP under partition**.
- Per-data-type thinking is the senior answer: one system, several stances.
