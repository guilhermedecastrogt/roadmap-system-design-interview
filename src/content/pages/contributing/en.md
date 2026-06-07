## You're very welcome here

This project grows through contributions. You don't need to be a distributed systems
expert — clarifying a sentence, fixing a typo, or translating a paragraph are all
genuinely valuable.

## Ways to contribute

- **Explanations** — make a confusing section clearer, or add an example.
- **Fixes** — correct technical mistakes, typos, or broken links.
- **Diagrams** — add ASCII or image diagrams to illustrate flows and architectures.
- **Examples** — contribute practical, interview-style scenarios.
- **Translations** — keep the English and Portuguese-BR versions in sync, or start a new language.

## Adding or editing a topic

Each topic is a Markdown file at:

```
src/content/topics/<slug>/<locale>.md
```

For example, the load balancer topic lives in
`src/content/topics/load-balancer/en.md` and `.../pt-BR.md`.

The frontmatter at the top of the file is **typed and validated**. Copy an existing
topic as a template and keep these fields:

```yaml
---
title: Load Balancer
slug: load-balancer
description: One-sentence summary shown on cards.
category: blocos-fundamentais   # introducao | blocos-fundamentais | topicos-de-entrevista | exemplos-praticos
order: 10                     # position within the stage
difficulty: beginner          # beginner | intermediate | advanced
status: published             # planned | in-progress | published
tags: [networking, availability]
updatedAt: 2026-01-15         # YYYY-MM-DD
beginnerSummary: A short, friendly one-paragraph explanation.
glossary:
  - term: Health check
    definition: A periodic probe that tells the balancer if a server is alive.
references:
  - label: Example reference
    url: https://example.com
---
```

The body uses standardized `## ` section headings. Keep them in this order so every
topic reads consistently:

`## What it is` · `## Why it matters` · `## Key concepts` · `## Architecture discussion` ·
`## Components` · `## Modules` · `## Interfaces` · `## Flows` ·
`## Software engineering perspective` · `## Trade-offs` · `## Interview relevance` ·
`## Practical examples` · `## Class notes`

A topic does not need every section — start with what you know and leave the rest for
the next contributor.

## Local setup

```bash
npm install
npm run dev          # start the dev server at http://localhost:3000
npm run validate:content   # check every topic's frontmatter
npm run typecheck    # TypeScript
npm run build        # full production build
```

## Pull request checklist

1. `npm run validate:content` passes.
2. `npm run build` succeeds.
3. If you edited the English version of a topic, note in the PR whether the
   Portuguese version still needs updating (and vice-versa).
4. Keep one topic / one idea per PR when you can — it makes review easier.

Thank you for helping other developers learn. 💚
