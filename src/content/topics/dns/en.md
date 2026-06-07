---
title: DNS
slug: dns
description: "How the internet turns a domain name like youtube.com into an IP address — and why it stays fast."
category: blocos-fundamentais
order: 10
difficulty: beginner
status: published
tags: [dns, networking, caching, infrastructure]
updatedAt: "2026-06-06"
beginnerSummary: >-
  DNS (Domain Name System) is the internet's address book. You type a name like
  youtube.com, and DNS finds the IP address your browser needs to connect. It's a
  distributed hierarchy of servers — and heavy caching with TTLs keeps it fast, so
  most lookups never travel the full chain.
glossary:
  - term: Resolver
    definition: "The server (usually your ISP or a public DNS like 1.1.1.1) that does the work of finding the IP and caching the answer."
  - term: Root nameserver
    definition: "The top of the DNS hierarchy. It doesn't know IPs — it points to the nameservers that handle each TLD (.com, .org)."
  - term: TLD server
    definition: "Handles a top-level domain such as .com, and points the resolver to the authoritative server for the exact domain."
  - term: Authoritative server
    definition: "The source of truth for a domain (e.g. youtube.com). It holds the real records and returns the requested one (usually an A/AAAA with the IP)."
  - term: Recursive query
    definition: "The client asks once and the resolver takes responsibility for returning the final, fully-resolved answer."
  - term: Iterative query
    definition: "The resolver walks the hierarchy itself, following referrals from root to TLD to authoritative."
  - term: TTL
    definition: "Time To Live — how long a cached DNS answer can be reused before a fresh lookup is required."
  - term: DNS cache
    definition: "A stored answer kept by the browser and resolver so repeat lookups are instant instead of repeating the whole journey."
references:
  - label: "Cloudflare — What is DNS?"
    url: https://www.cloudflare.com/learning/dns/what-is-dns/
  - label: "MDN — What is a domain name?"
    url: https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_domain_name
  - label: "AWS — What is DNS?"
    url: https://aws.amazon.com/route53/what-is-dns/
  - label: "IANA — Root servers"
    url: https://www.iana.org/domains/root/servers
---

> Use the interactive lesson above to **watch** a DNS lookup travel through the
> hierarchy, switch between recursive and iterative modes, and see how caching makes
> the second lookup instant. The sections below are the quick reference.

## What it is

**DNS (the Domain Name System)** is the internet's address book. Computers connect
using IP addresses, but humans prefer names — so DNS translates a domain name into the
location of the resource we want.

```
youtube.com  ->  142.250.x.x   (illustrative only -- real IPs change)
```

Without DNS you'd have to memorize an IP for every site you visit.

## Why it matters

- **Humans use names, machines use IPs.** DNS is the bridge between the two.
- **It's usually the first step of a request** — before it reaches a load balancer, API,
  or database (and skipped entirely when the answer is already cached or the connection is
  still open).
- **It's globally distributed and cached**, which is what keeps it fast and highly
  available even at internet scale.

## DNS is a hierarchy

DNS isn't one big server — it's a tree of responsibilities, which is what lets it scale
to the whole internet:

- **Resolver** — your entry point (ISP or public DNS). It coordinates the lookup and
  caches results.
- **Root nameserver** — points to the nameservers that handle each TLD (`.com`, `.org`…).
- **TLD server** — handles `.com`, `.org`, `.net`, … and points to the authoritative
  server.
- **Authoritative server** — the source of truth that returns the requested record
  (for a website, usually an A/AAAA with the IP).

Each level only knows enough to send you one step closer to the answer.

> DNS records aren't only IPs: **A/AAAA** (IPv4/IPv6), **CNAME** (alias), **MX** (mail),
> **TXT**… For normal web browsing you usually end at an **A/AAAA** record.

## Recursive vs iterative

- **Recursive:** the client asks the resolver once, and the resolver takes
  responsibility for returning the final answer.
- **Iterative:** the resolver talks to each server step by step, following referrals
  (root → TLD → authoritative) until it gets the authoritative answer.

In one line: **recursive** describes the *client ↔ resolver* leg; **iterative** describes
the *resolver ↔ hierarchy* leg. The referrals go to the **resolver**, not your browser.

*(Toggle between the two in the diagram above to see the difference.)*

## Caching & TTL

The full journey costs several network round-trips, so answers get **cached**:

- The **browser** may cache DNS results, and the **resolver** caches them too.
- Each record is stored with a **TTL (Time To Live)**.
- TTL defines how long the result can be reused before a new lookup is needed.
- This reduces latency and avoids repeating the whole resolution every time.

## Trade-offs & practical notes

- **TTL is a trade-off:** a *low* TTL keeps records fresh but causes more lookups; a
  *high* TTL is faster and cheaper but means changes (and failovers) propagate slowly.
- **Stale caches bite during migrations:** if you change where a domain points,
  cached records can still send users to the old address until the TTL expires.
- **DNS is a dependency you don't own end-to-end** — use reputable resolvers and
  multiple authoritative nameservers for resilience.

## Interview relevance

DNS is a favorite warm-up because it's foundational:

- It's the classic answer to **"what happens when you type a URL and press enter?"** —
  DNS resolution comes first.
- It naturally brings in **latency, caching, TTLs, and availability** — themes that
  reappear all over system design.
- It frames how requests *begin*, before they ever reach your backend services.

You rarely design DNS itself, but showing you understand it signals you think about the
whole request path, not just the server.

## Class notes

- DNS = name → record (usually an IP), resolved through a hierarchy (resolver → root → TLD → authoritative).
- Recursive = client ↔ resolver (resolver does the work); iterative = resolver ↔ hierarchy (follows referrals).
- Caching + TTL is *why* DNS feels instant — most lookups never reach the root.
