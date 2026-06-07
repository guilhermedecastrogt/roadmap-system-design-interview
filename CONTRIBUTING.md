# Contributing

Thanks for helping other developers learn system design! This project grows through
contributions, and **you don't need to be an expert** — clarifying a sentence, fixing a
typo, adding a diagram, or translating a paragraph are all genuinely valuable.

> There is also an in-app version of this guide at `/en/contributing` and
> `/pt-BR/contributing`, rendered from `src/content/pages/contributing/`.

## Ways to contribute

- **Explanations** — make a confusing section clearer or add an example.
- **Fixes** — correct technical mistakes, typos, or broken links.
- **Diagrams** — add ASCII or image diagrams to illustrate flows and architectures.
- **Examples** — contribute practical, interview-style scenarios.
- **Translations** — keep `en` and `pt-BR` in sync, or start a new language.

Good first issues are the topics marked `status: planned` or `status: in-progress`.

## Local development

Requirements: **Node 18.18+** (Node 20 recommended) and npm.

```bash
npm install
npm run dev                # start at http://localhost:3000
npm run validate:content   # validate topic frontmatter
npm run typecheck          # TypeScript
npm run lint               # ESLint
npm run build              # full production build
```

## Adding or editing a topic

Topics are Markdown files at:

```
src/content/topics/<slug>/<locale>.md      # locale = en | pt-BR
```

1. Pick a kebab-case `slug` (e.g. `message-queue`). Create the folder and an `en.md`.
2. Copy the frontmatter block from an existing topic (e.g.
   `src/content/topics/load-balancer/en.md`) and fill in every field.
3. Write the body using the standard `## ` section headings, in this order:

   ```
   ## What it is
   ## Why it matters
   ## Key concepts
   ## Architecture discussion
   ## Components
   ## Modules
   ## Interfaces
   ## Flows
   ## Software engineering perspective
   ## Trade-offs
   ## Interview relevance
   ## Practical examples
   ## Class notes
   ```

   You don't need every section — start with what you know. In `pt-BR.md` you may
   translate the headings (the table of contents is generated from whatever `##`
   headings exist).

4. Add the matching `pt-BR.md` translation when you can. If a translation is missing, the
   site falls back to the English version, and `validate:content` prints a (non-blocking)
   warning.

### Frontmatter reference

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | Display title. |
| `slug` | string | kebab-case; **must match the folder name**. |
| `description` | string | One sentence; shown on cards. |
| `category` | enum | `introducao`, `blocos-fundamentais`, `topicos-de-entrevista`, `exemplos-praticos`. |
| `order` | number | Position within the stage (ascending). |
| `difficulty` | enum | `beginner`, `intermediate`, `advanced`. |
| `status` | enum | `planned`, `in-progress`, `published`. |
| `tags` | string[] | Lowercase keywords. |
| `updatedAt` | string | ISO date `YYYY-MM-DD`. |
| `beginnerSummary` | string? | Optional one-paragraph intro callout. |
| `glossary` | `{term, definition}[]` | Optional. |
| `references` | `{label, url}[]` | Optional; `url` must be valid. |

The schema is enforced by [`src/content/schema.ts`](src/content/schema.ts). Run
`npm run validate:content` to check your file before opening a PR.

## Adding a new stage or locale

- **Stage:** add an entry to `src/content/stages.ts` (id + order + localized labels) and
  use that id as a topic `category`. The schema's `categories` list and the roadmap update
  automatically.
- **Locale:** add it to `locales` in `src/i18n/routing.ts`, create
  `src/messages/<locale>.json`, and add `<locale>.md` files. Update `LOCALES` in
  `scripts/validate-content.ts`.

## Pull request checklist

- [ ] `npm run validate:content` passes.
- [ ] `npm run typecheck` and `npm run build` succeed.
- [ ] One topic / one idea per PR where possible.
- [ ] If you changed one language of a topic, note in the PR whether the other language
      still needs updating.
- [ ] Keep the tone educational and concise — explanations over marketing.

## Code style

- TypeScript, functional React components, server components by default (`'use client'`
  only when a component needs interactivity).
- Tailwind utility classes; use the semantic tokens (`bg`, `surface`, `fg`, `muted`,
  `accent`, `border`) rather than raw colors so dark mode keeps working.
- Keep components small and reusable; content stays in Markdown, not in components.

## Code of conduct

Be kind and constructive. We're all here to learn. Assume good intent, give specific and
respectful feedback, and welcome newcomers.

Thank you! 💚
