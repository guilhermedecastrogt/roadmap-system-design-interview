import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ExternalLink,
  PencilLine,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Markdown, extractHeadings } from '@/components/Markdown';
import { DifficultyBadge, StatusBadge } from '@/components/Badges';
import { InteractiveGlossary } from '@/components/InteractiveGlossary';
import { topicExperiences } from '@/components/topics/registry';
import { getAllTopics, getTopic, getAllSlugs } from '@/content/topics';
import { stagesById } from '@/content/stages';
import { routing, type Locale } from '@/i18n/routing';
import { editTopicUrl } from '@/lib/site';
import { formatDate } from '@/lib/utils';

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const topic = await getTopic(params.slug, params.locale);
  if (!topic) return {};
  return {
    title: topic.title,
    description: topic.description,
    keywords: topic.tags,
  };
}

export default async function TopicDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  const topic = await getTopic(params.slug, params.locale);
  if (!topic) notFound();

  const t = await getTranslations('Topic');
  const stage = stagesById[topic.category];
  const headings = extractHeadings(topic.body);
  const Experience = topicExperiences[topic.slug];

  // Neighbours for prev/next navigation (global learning order).
  const all = await getAllTopics(params.locale);
  const index = all.findIndex((entry) => entry.slug === topic.slug);
  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('backToTopics')}
      </Link>

      {/* Header */}
      <header className="mt-6 border-b border-border pb-8">
        <p className="text-sm font-medium text-accent">
          {stage.label[params.locale]}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          {topic.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{topic.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <DifficultyBadge value={topic.difficulty} />
          <StatusBadge value={topic.status} />
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {t('updated', { date: formatDate(topic.updatedAt, params.locale) })}
          </span>
          <a
            href={editTopicUrl(topic.slug, params.locale)}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 hover:text-fg"
          >
            <PencilLine className="h-4 w-4" aria-hidden />
            {t('editOnGitHub')}
          </a>
        </div>
      </header>

      {/* Interactive experience (topics that register one) */}
      {Experience && (
        <section className="mt-10" aria-label={t('interactive')}>
          <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('interactive')}
          </p>
          <Experience locale={params.locale} />
        </section>
      )}

      <div className="mt-12 gap-10 lg:grid lg:grid-cols-[1fr_15rem]">
        {/* Main column */}
        <div className="min-w-0 max-w-prose">
          {topic.beginnerSummary && (
            <aside className="mb-8 rounded-xl border border-accent/30 bg-accent/[0.06] p-5">
              <p className="mb-1.5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                <BookOpen className="h-4 w-4" aria-hidden />
                {t('beginnerSummary')}
              </p>
              <p className="text-[0.975rem] leading-7 text-fg/90">
                {topic.beginnerSummary}
              </p>
            </aside>
          )}

          <Markdown content={topic.body} />
        </div>

        {/* Table of contents */}
        {headings.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {t('onThisPage')}
              </p>
              <nav className="space-y-2 border-l border-border">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className="-ml-px block border-l border-transparent py-0.5 pl-3 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {/* Glossary (full width — flip cards) */}
      {topic.glossary.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            {t('glossary')}
          </h2>
          <div className="mt-5">
            <InteractiveGlossary entries={topic.glossary} />
          </div>
        </section>
      )}

      {/* References */}
      {topic.references.length > 0 && (
        <section className="mt-12 max-w-prose">
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            {t('references')}
          </h2>
          <ul className="mt-4 space-y-2">
            {topic.references.map((ref) => (
              <li key={ref.url}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  {ref.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Prev / Next */}
      <nav className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/topics/${prev.slug}`}
            className="group flex flex-col gap-1 rounded-xl border border-border p-4 transition-colors hover:border-accent/40"
          >
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {t('prevTopic')}
            </span>
            <span className="font-medium text-fg group-hover:text-accent">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/topics/${next.slug}`}
            className="group flex flex-col items-end gap-1 rounded-xl border border-border p-4 text-right transition-colors hover:border-accent/40"
          >
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              {t('nextTopic')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="font-medium text-fg group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
