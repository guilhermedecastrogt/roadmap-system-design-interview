import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { type Locale, defaultLocale } from '@/i18n/routing';
import {
  topicFrontmatterSchema,
  type Topic,
  type TopicSummary,
  type Category,
} from './schema';
import { stages } from './stages';

const TOPICS_DIR = path.join(process.cwd(), 'src', 'content', 'topics');

/** Read every topic slug (one directory per topic). */
async function readSlugs(): Promise<string[]> {
  const entries = await fs.readdir(TOPICS_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

/**
 * Load a single topic for a locale. Falls back to the default locale if the
 * requested translation does not exist yet, so a partially translated repo
 * still renders. Returns `null` if the topic does not exist at all.
 */
export async function getTopic(
  slug: string,
  locale: Locale,
): Promise<Topic | null> {
  const candidates = [locale, defaultLocale];

  for (const candidate of candidates) {
    const filePath = path.join(TOPICS_DIR, slug, `${candidate}.md`);
    let raw: string;
    try {
      raw = await fs.readFile(filePath, 'utf8');
    } catch {
      continue;
    }

    const { data, content } = matter(raw);
    const parsed = topicFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid frontmatter in ${slug}/${candidate}.md:\n${parsed.error.message}`,
      );
    }

    return {
      ...parsed.data,
      locale,
      body: content.trim(),
    };
  }

  return null;
}

/** Load every topic for a locale, sorted by stage order then topic order. */
export async function getAllTopics(locale: Locale): Promise<Topic[]> {
  const slugs = await readSlugs();
  const topics = await Promise.all(slugs.map((slug) => getTopic(slug, locale)));

  return topics
    .filter((t): t is Topic => t !== null)
    .sort(compareTopics);
}

/** Same as `getAllTopics` but returns only the fields cards need. */
export async function getTopicSummaries(
  locale: Locale,
): Promise<TopicSummary[]> {
  const topics = await getAllTopics(locale);
  return topics.map(toSummary);
}

export type RoadmapStage = {
  id: Category;
  topics: TopicSummary[];
};

/**
 * Build the roadmap: stages in learning order, each with its topics sorted by
 * `order`. The homepage renders directly from this — no hardcoded items.
 */
export async function getRoadmap(locale: Locale): Promise<RoadmapStage[]> {
  const summaries = await getTopicSummaries(locale);

  return stages
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      id: stage.id,
      topics: summaries
        .filter((t) => t.category === stage.id)
        .sort((a, b) => a.order - b.order),
    }));
}

/** All slugs, used by `generateStaticParams`. */
export async function getAllSlugs(): Promise<string[]> {
  return readSlugs();
}

function toSummary(t: Topic): TopicSummary {
  const { title, slug, description, category, order, difficulty, status, tags, updatedAt, locale } = t;
  return { title, slug, description, category, order, difficulty, status, tags, updatedAt, locale };
}

const stageOrder = new Map(stages.map((s) => [s.id, s.order]));

function compareTopics(a: Topic, b: Topic): number {
  const byStage = (stageOrder.get(a.category) ?? 0) - (stageOrder.get(b.category) ?? 0);
  if (byStage !== 0) return byStage;
  return a.order - b.order;
}
