import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type TopicSummary } from '@/content/schema';
import { stagesById } from '@/content/stages';
import { type Locale } from '@/i18n/routing';
import { DifficultyBadge, StatusBadge } from './Badges';
import { formatDate } from '@/lib/utils';

export function TopicCard({
  topic,
  locale,
}: {
  topic: TopicSummary;
  locale: Locale;
}) {
  const t = useTranslations('Topics');

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {stagesById[topic.category].label[locale]}
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted transition-colors group-hover:text-accent" aria-hidden />
      </div>

      <h3 className="text-lg font-semibold leading-snug tracking-tight text-fg">
        {topic.title}
      </h3>
      <p className="line-clamp-2 text-sm text-muted">{topic.description}</p>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <DifficultyBadge value={topic.difficulty} />
        <StatusBadge value={topic.status} />
      </div>

      <p className="mt-auto pt-2 text-xs text-muted">
        {t('updated', { date: formatDate(topic.updatedAt, locale) })}
      </p>
    </Link>
  );
}
