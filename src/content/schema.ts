import { z } from 'zod';

/**
 * Content locales. Kept as a local literal (rather than importing the i18n
 * routing config) so this schema can be imported by standalone tooling such
 * as `scripts/validate-content.ts` without pulling in next-intl.
 */
export type ContentLocale = 'en' | 'pt-BR';

/**
 * The Topic schema is the single source of truth for content.
 *
 * Each topic lives in `src/content/topics/<slug>/<locale>.md`.
 * The YAML frontmatter is validated against `topicFrontmatterSchema`.
 * The Markdown body holds the long-form sections (What it is, Why it
 * matters, Trade-offs, …) under standardized `## ` headings.
 */

export const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof difficulties)[number];

export const statuses = ['planned', 'in-progress', 'published'] as const;
export type Status = (typeof statuses)[number];

/**
 * Roadmap stages, in learning order. The `category` field of every topic
 * must be one of these ids. See `stages.ts` for labels and descriptions.
 */
export const categories = [
  'introducao',
  'blocos-fundamentais',
  'topicos-de-entrevista',
  'exemplos-praticos',
] as const;
export type Category = (typeof categories)[number];

const glossaryEntrySchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
});

const referenceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

/** Validated metadata that lives in each Markdown file's frontmatter. */
export const topicFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  description: z.string().min(1),
  category: z.enum(categories),
  order: z.number().int().nonnegative(),
  difficulty: z.enum(difficulties),
  status: z.enum(statuses),
  tags: z.array(z.string().min(1)).default([]),
  beginnerSummary: z.string().min(1).optional(),
  glossary: z.array(glossaryEntrySchema).default([]),
  references: z.array(referenceSchema).default([]),
  // YAML parses an unquoted `2026-01-20` into a Date, so accept both a Date
  // and a string and normalize to a `YYYY-MM-DD` string. Contributors can
  // write the date with or without quotes.
  updatedAt: z
    .preprocess(
      (value) =>
        value instanceof Date ? value.toISOString().slice(0, 10) : value,
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'updatedAt must be an ISO date (YYYY-MM-DD)'),
    ),
});

export type TopicFrontmatter = z.infer<typeof topicFrontmatterSchema>;
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
export type Reference = z.infer<typeof referenceSchema>;

/** A fully loaded topic: validated frontmatter + rendered body + locale. */
export type Topic = TopicFrontmatter & {
  locale: ContentLocale;
  /** Raw Markdown body (everything after the frontmatter). */
  body: string;
};

/** Lightweight shape used by roadmap and listing cards. */
export type TopicSummary = Pick<
  Topic,
  | 'title'
  | 'slug'
  | 'description'
  | 'category'
  | 'order'
  | 'difficulty'
  | 'status'
  | 'tags'
  | 'updatedAt'
  | 'locale'
>;
