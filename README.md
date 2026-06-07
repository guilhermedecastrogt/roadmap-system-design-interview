# System Design Interview Roadmap

> A bilingual (English / Portuguese-BR), open-source study roadmap for **system design
> interviews** — built from real course notes and shaped into a guided, **interactive**
> learning path.

This is a developer-focused learning project, **not** a marketing site and **not** a plain
docs page. It teaches the building blocks of system design — DNS, CDNs, load balancers,
caches, queues, databases, gateways — and the engineering **trade-offs** behind them
(scalability, availability, cost, complexity), through **motion, flow, and interaction**
rather than walls of text.

Two things make it different:

- The homepage renders a **data-driven roadmap** — every topic file you add appears
  automatically as a clickable node in the correct section. Nothing is hardcoded.
- Topics can ship an **interactive lesson** — animated flow diagrams, step-by-step
  playback, comparison toggles, and live simulations — so you *see* a system work, not
  just read about it. (See the [DNS lesson](src/content/topics/dns) for the reference
  implementation.)

---

## ✨ Features

- **Interactive, animated lessons** — a reusable flow-diagram engine (animated packets,
  highlighted nodes, synced step timeline), mode toggles, cache/TTL simulators, and
  flip-card glossaries. Teach through motion, keep it readable.
- **Data-driven roadmap** — generated from topic metadata; add a file, get a roadmap node.
- **Bilingual** (`en`, `pt-BR`) via `next-intl`, with localized routes like
  `/en/topics/dns` and `/pt-BR/topics/dns`.
- **Structured topic schema** validated with **zod** (typed frontmatter + standardized
  Markdown sections), so content stays consistent.
- **Premium, themeable UI** — an "engineering blueprint" homepage (grid texture, aurora
  glows, film grain), distinctive type, and full **dark / light mode** driven by semantic
  tokens.
- **Contributor-friendly** — clear folders, a content-validation script, and a registry
  pattern for adding interactive lessons.

## 🧱 Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS (semantic CSS-variable tokens) |
| i18n | next-intl |
| Animation | framer-motion |
| Content | Markdown + gray-matter, rendered with react-markdown + remark-gfm |
| Validation | zod |
| Icons | lucide-react |
| Fonts | Bricolage Grotesque · IBM Plex Sans · JetBrains Mono (via `next/font`) |
| Theme | next-themes |

## 🚀 Getting started

```bash
npm install
npm run dev          # http://localhost:3000  (redirects to /en)
```

Other scripts:

```bash
npm run build              # production build
npm run start              # serve the production build
npm run lint               # ESLint
npm run typecheck          # TypeScript, no emit
npm run validate:content   # validate every topic's frontmatter
```

> Set your repository URL in [`src/lib/site.ts`](src/lib/site.ts) (`GITHUB_URL`). It drives
> the header link, the footer, and the per-topic "improve this page" edit links.

## 🗺️ Learning sections

The roadmap mirrors the course outline, defined in
[`src/content/stages.ts`](src/content/stages.ts):

1. **Introdução / Introduction** — what system design is and how to use the roadmap.
2. **Blocos Fundamentais / Fundamental Building Blocks** — DNS, CDN, load balancers,
   caching, message queues & streaming, rate limiting, CAP theorem, API gateway, databases,
   object storage, application servers, web servers / reverse proxies, REST·gRPC·GraphQL,
   SLAs, and estimations.
3. **Tópicos de Entrevista / Interview Topics** — frameworks and what interviewers look for.
4. **Exemplos Práticos / Practical Examples** — full question walkthroughs.

**Progress:** the full structure is scaffolded as topic stubs. **DNS** is the first
published, fully interactive lesson; the remaining topics are `planned` and filled in
lesson by lesson.

## 📁 Project structure

```
src/
├─ app/[locale]/              # localized routes
│  ├─ page.tsx                # homepage (hero + data-driven roadmap)
│  ├─ topics/page.tsx         # listing (filter by section)
│  ├─ topics/[slug]/page.tsx  # topic detail (mounts an interactive lesson if registered)
│  ├─ about/  contributing/   # Markdown-driven pages
│  ├─ layout.tsx              # root shell: fonts, theme, intl, header, footer, grain
│  └─ not-found.tsx
├─ components/
│  ├─ flow/                   # REUSABLE: FlowDiagram, Stepper (animated topic engine)
│  ├─ topics/
│  │  ├─ registry.ts          # maps slug → interactive lesson component
│  │  └─ dns/                 # DNS lesson: content.ts + DnsLesson/Experience/Comparison/CacheTtlSim
│  ├─ Roadmap.tsx  TopicCard.tsx  TopicsBrowser.tsx
│  ├─ InteractiveGlossary.tsx # REUSABLE: flip-card glossary from frontmatter
│  ├─ BlueprintBackdrop.tsx  SchemaCard.tsx  BuildingBlocksMarquee.tsx   # homepage FX
│  ├─ Header.tsx  Footer.tsx  Badges.tsx  Markdown.tsx
│  └─ ThemeProvider.tsx  ThemeToggle.tsx  LocaleSwitcher.tsx
├─ content/
│  ├─ schema.ts               # zod Topic schema (single source of truth)
│  ├─ stages.ts               # roadmap section definitions
│  ├─ topics.ts               # loaders: getAllTopics / getTopic / getRoadmap
│  ├─ pages.ts                # loader for About / Contributing prose
│  ├─ topics/<slug>/{en,pt-BR}.md
│  └─ pages/{about,contributing}/{en,pt-BR}.md
├─ i18n/                      # routing, request config, navigation helpers
├─ messages/{en,pt-BR}.json   # UI strings
├─ lib/                       # utils, site constants
├─ app/globals.css            # tokens, prose styles, textures, motion utilities
└─ middleware.ts              # locale negotiation
scripts/validate-content.ts
```

## 🧩 The topic schema

Each topic lives in `src/content/topics/<slug>/<locale>.md`. Frontmatter is validated by
`topicFrontmatterSchema` in [`src/content/schema.ts`](src/content/schema.ts):

```yaml
---
title: DNS
slug: dns
description: "One-sentence summary shown on cards."
category: blocos-fundamentais   # introducao | blocos-fundamentais | topicos-de-entrevista | exemplos-praticos
order: 10
difficulty: beginner            # beginner | intermediate | advanced
status: published               # planned | in-progress | published
tags: [dns, networking]
updatedAt: "2026-06-06"          # YYYY-MM-DD
beginnerSummary: A friendly one-paragraph intro.
glossary:
  - term: Resolver
    definition: "The server that finds the IP and caches the answer."
references:
  - label: "Cloudflare — What is DNS?"
    url: https://www.cloudflare.com/learning/dns/what-is-dns/
---
```

The Markdown body uses standardized `## ` headings (which also build the on-page table of
contents):

`What it is` · `Why it matters` · `Key concepts` · `Architecture discussion` ·
`Components` · `Modules` · `Interfaces` · `Flows` · `Software engineering perspective` ·
`Trade-offs` · `Interview relevance` · `Practical examples` · `Class notes`

A topic doesn't need every section — start with what you have.

## ➕ Adding a topic (prose)

1. Create `src/content/topics/<slug>/en.md` (and `pt-BR.md`).
2. Copy the frontmatter from an existing topic and fill it in.
3. Write the body using the standard section headings.
4. Run `npm run validate:content` and `npm run dev` — the roadmap and glossary cards update
   automatically.

## 🎬 Adding an interactive lesson

Interactive lessons reuse the same primitives, so each new topic is mostly content:

1. **Reusable building blocks** live in [`src/components/flow/`](src/components/flow):
   `FlowDiagram` (geometry-measured animated diagram with a traveling packet) and `Stepper`
   (a clickable timeline synced to the diagram). `InteractiveGlossary` renders from any
   topic's frontmatter `glossary`.
2. **Co-locate the interactive copy** in a typed, bilingual `content.ts` next to the topic's
   components (see [`src/components/topics/dns/content.ts`](src/components/topics/dns/content.ts)).
   Long-form prose stays in the Markdown file; only the strings that drive widgets go here.
3. **Build the lesson component** (e.g. `XxxLesson.tsx`) by composing `FlowDiagram` +
   `Stepper` + any topic-specific widgets, using [the DNS lesson](src/components/topics/dns)
   as a template.
4. **Register it** in [`src/components/topics/registry.ts`](src/components/topics/registry.ts):

   ```ts
   export const topicExperiences = {
     dns: DnsLesson,
     // 'load-balancer': LoadBalancerLesson,
   };
   ```

   The topic page automatically mounts the experience above the Markdown prose for that
   slug. No page changes needed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide and frontmatter reference.

## 🌍 Adding a language

Add the locale to [`src/i18n/routing.ts`](src/i18n/routing.ts), create
`src/messages/<locale>.json`, add `<locale>.md` files per topic, and extend the locale list
in `scripts/validate-content.ts`. Missing translations fall back to the default locale.

## 🤝 Contributing

Contributions of explanations, fixes, diagrams, examples, interactive widgets, and
**translations** are very welcome — including from first-time contributors. Start with the
topics marked `planned`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

[MIT](LICENSE). Content is shared for learning.
