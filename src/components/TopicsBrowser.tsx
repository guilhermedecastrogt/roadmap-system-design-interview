'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TopicCard } from './TopicCard';
import { stages } from '@/content/stages';
import { type TopicSummary, type Category } from '@/content/schema';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type Filter = Category | 'all';

export function TopicsBrowser({
  topics,
  locale,
}: {
  topics: TopicSummary[];
  locale: Locale;
}) {
  const t = useTranslations('Topics');
  const [filter, setFilter] = useState<Filter>('all');

  // Only show stage chips that actually have topics.
  const populated = new Set(topics.map((topic) => topic.category));
  const availableStages = stages.filter((s) => populated.has(s.id));

  const visible =
    filter === 'all' ? topics : topics.filter((topic) => topic.category === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Stage filter">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          {t('all')}
        </FilterChip>
        {availableStages.map((stage) => (
          <FilterChip
            key={stage.id}
            active={filter === stage.id}
            onClick={() => setFilter(stage.id)}
          >
            {stage.label[locale]}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          {t('empty')}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-border text-muted hover:bg-surface-2 hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}
