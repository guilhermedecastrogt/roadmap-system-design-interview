You are building a production-quality Next.js repository and website for a public System Design study project focused on interview preparation.

Important:
Do not create a generic startup landing page.
Do not make this look like a marketing website.
This project is an educational, open-source, developer-focused learning platform.

Project goal:
Create a bilingual repository and website for studying System Design with a focus on System Design interviews.

This project will be updated continuously as I progress through an online course. After each class, I will send notes and learnings, and the repository must be easy to update with new topics and content.

The site should feel like a guided learning roadmap for beginner and entry-level developers preparing for interviews.

Core project description:
This repository is for studying System Design focused on System Design interviews.

It should include:
- fundamental building blocks
- interview-focused topics
- practical examples inspired by real interview scenarios

System Design coverage:
We are studying how to design the architecture of systems and discuss:
- infrastructure
- components
- modules
- interfaces
- flows

We also study how system requirements are designed and implemented from a software engineering perspective, considering trade-offs such as:
- scalability
- security
- cost
- complexity

The project must cover both:
- high-level design
- low-level design

High-level topics:
- scalability
- availability
- resilience
- API Gateway
- cache
- databases

Low-level topics:
- modules
- services
- schemas
- algorithms
- diagrams

Technical stack:
- Next.js
- App Router
- TypeScript
- Tailwind CSS
- MDX or markdown-based content
- next-intl for i18n
- zod for content validation
- lucide-react for icons

Main requirements:
- Build a maintainable and scalable repo
- Support English and Portuguese-BR
- Make the codebase contributor-friendly
- Organize content as structured topic files
- Make it easy to add new lessons over time
- Add dark mode and light mode
- Make the UI modern, minimal, polished, and credible for developers

Routing:
Support localized routes such as:
- /en
- /pt-BR
- /en/topics/load-balancer
- /pt-BR/topics/load-balancer

Homepage:
The homepage must include a visual roadmap of the repository.

Roadmap requirements:
- Show the learning journey as roadmap items
- Each topic in the roadmap must be clickable
- Clicking a roadmap topic must navigate to that topic page
- The roadmap should be generated from topic data, not manually hardcoded
- The roadmap must work well on mobile and desktop
- Use a clean vertical timeline or zig-zag guided path
- Keep the design clear and structured, not visually noisy

Each roadmap item should display:
- title
- short description
- difficulty
- status

Recommended roadmap stages:
- Foundations
- High-Level Design
- Low-Level Design
- Interview Patterns
- Practical Interview Cases

Pages to build:
- homepage
- topics listing page
- topic detail page
- about page
- contributing page

Topic page structure:
Each topic page should support:
- title
- slug
- description
- category
- order
- difficulty
- status
- tags
- what it is
- why it matters
- key concepts
- architecture discussion
- components
- modules
- interfaces
- flows
- software engineering perspective
- trade-offs
- interview relevance
- practical examples
- glossary
- class notes
- beginner summary
- references
- last updated

Open-source requirements:
- write a strong README.md
- add CONTRIBUTING.md
- organize content folders clearly
- add example topic content in both languages
- make the repo easy for beginner contributors
- encourage contributions for explanations, fixes, diagrams, examples, and translations

Design direction:
- minimal and modern
- serious but approachable
- educational and developer-focused
- strong typography and spacing
- avoid generic SaaS visuals
- avoid excessive gradients
- avoid fluffy marketing copy
- prioritize readability and content structure

Architecture expectations:
- use reusable components
- separate content, UI, and metadata cleanly
- create a scalable topic schema
- create helper utilities for loading and sorting localized content
- make the homepage roadmap automatically reflect topic metadata

Suggested content schema:
Use a structured type similar to:

type Topic = {
  title: string
  slug: string
  description: string
  category: string
  order: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'planned' | 'in-progress' | 'published'
  tags: string[]
  updatedAt: string
  locale: 'en' | 'pt-BR'
}

Deliverables:
- full project structure
- working Next.js app
- i18n setup
- content architecture
- homepage with clickable roadmap
- topic pages
- example bilingual topics
- README.md
- CONTRIBUTING.md

Execution instructions:
1. First design the project structure and folder architecture.
2. Then implement i18n and routing.
3. Then implement content loading and topic schema.
4. Then build the homepage roadmap from topic data.
5. Then build topic pages and listing pages.
6. Then create About and Contributing pages.
7. Then write README and CONTRIBUTING.
8. Use clean code and sensible naming.
9. Prefer maintainability over unnecessary complexity.
10. Include realistic starter content in English and Portuguese-BR.

Do not stop at high-level suggestions.
Actually create the repository structure, code, components, and sample content.
