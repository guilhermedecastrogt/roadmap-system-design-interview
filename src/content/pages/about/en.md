## What this is

This is a public, open-source **study log for system design interviews**. It started
as a set of personal notes taken while following an online course, and is being
shaped into a structured, bilingual roadmap that anyone can learn from — or
contribute to.

The goal is not to be an exhaustive encyclopedia. It is to be a **clear, guided path**
for beginner and entry-level developers who want to walk into a system design
interview with confidence about the vocabulary, the building blocks, and the way
trade-offs are discussed.

## Who it's for

- Developers preparing for their first system design interviews.
- Self-taught and bootcamp engineers who never had a formal "distributed systems" course.
- Anyone who learns better from a roadmap than from a pile of disconnected articles.

## How it's organized

Content is grouped into four sections that build on each other:

1. **Introduction** — what system design is and how to use this roadmap.
2. **Fundamental Building Blocks** — the core components every system is made of: DNS, CDN, load balancers, caches, queues, databases, and more.
3. **Interview Topics** — frameworks and what interviewers actually look for.
4. **Practical Examples** — full walkthroughs of classic questions.

Every topic follows the same structure — *what it is*, *why it matters*, *key concepts*,
*architecture discussion*, *trade-offs*, *interview relevance*, and more — so you always
know where to look.

## How it's built

The site is a Next.js (App Router) application written in TypeScript, styled with
Tailwind CSS, and localized with next-intl. Content lives in Markdown files with
typed, zod-validated frontmatter, so the roadmap on the homepage is generated
automatically from the topics that exist — there is nothing to keep in sync by hand.

> This is a living document. Topics marked **planned** or **in progress** are exactly
> where new contributions are most welcome.
