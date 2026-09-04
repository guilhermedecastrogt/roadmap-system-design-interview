'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, CodeSurface, Segmented } from '../api-track/ApiKit';
import { restContent, type PageMode } from './content';

/** Twelve fake tweets, newest first — enough to page through. */
const TWEETS = Array.from({ length: 12 }, (_, i) => ({
  id: `t_${912 - i}`,
  authorId: i % 3 === 0 ? 'u_42' : 'u_7',
  hashtag: i % 2 === 0,
}));

/**
 * The collection URL builder: page size, filter and paging strategy, with the
 * request URL and the response rebuilt live. Paging through with a cursor and
 * then with page numbers is the fastest way to feel why the two differ.
 */
export function RestCollections({ locale }: { locale: Locale }) {
  const t = restContent[locale].collections;

  const [limit, setLimit] = useState(t.limits[0]);
  const [filterId, setFilterId] = useState(t.filters[0].id);
  const [mode, setMode] = useState<PageMode>('offset');
  const [page, setPage] = useState(0);

  const filter = t.filters.find((f) => f.id === filterId)!;

  const rows = useMemo(() => {
    if (filterId === 'author') return TWEETS.filter((x) => x.authorId === 'u_42');
    if (filterId === 'hashtag') return TWEETS.filter((x) => x.hashtag);
    return TWEETS;
  }, [filterId]);

  const totalPages = Math.max(1, Math.ceil(rows.length / limit));
  const safePage = Math.min(page, totalPages - 1);
  const slice = rows.slice(safePage * limit, safePage * limit + limit);
  const nextItem = rows[safePage * limit + limit];
  const hasMore = Boolean(nextItem);

  const query = [
    `limit=${limit}`,
    filter.query,
    mode === 'offset' ? `page=${safePage + 1}` : safePage > 0 ? `cursor=${slice[0]?.id ?? ''}` : '',
  ]
    .filter(Boolean)
    .join('&');

  const url = `GET /v1/tweets?${query}`;

  const response = JSON.stringify(
    mode === 'offset'
      ? {
          data: slice.map((x) => ({ id: x.id, authorId: x.authorId })),
          page: safePage + 1,
          limit,
          totalPages,
          totalItems: rows.length,
        }
      : {
          data: slice.map((x) => ({ id: x.id, authorId: x.authorId })),
          limit,
          nextCursor: nextItem ? nextItem.id : null,
        },
    null,
    2,
  );

  function change<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        {/* controls */}
        <div className="space-y-2.5">
          <Segmented
            label={t.limitLabel}
            size="sm"
            value={String(limit)}
            options={t.limits.map((n) => ({ id: String(n), label: String(n) }))}
            onChange={change((v: string) => setLimit(Number(v)))}
          />
          <Segmented
            label={t.filterLabel}
            size="sm"
            value={filterId}
            options={t.filters.map((f) => ({ id: f.id, label: f.label }))}
            onChange={change((v: string) => setFilterId(v))}
          />
          <Segmented
            label={t.modeLabel}
            size="sm"
            value={mode}
            options={t.modes.map((m) => ({ id: m.id, label: m.label }))}
            onChange={change((v: PageMode) => setMode(v))}
          />
        </div>

        {/* url */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.05] px-3 py-2.5">
          <span className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">
            {t.urlLabel}
          </span>
          <motion.code
            key={url}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="break-all font-mono text-[0.75rem] font-semibold text-fg"
          >
            {url}
          </motion.code>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <CodeSurface title={t.responseLabel} body={response} tone="emerald" />

          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <p className="text-sm font-semibold text-fg">
                {t.modes.find((m) => m.id === mode)!.label}
              </p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
                {t.modes.find((m) => m.id === mode)!.explain}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  hasMore
                    ? 'bg-accent text-accent-fg hover:shadow-md hover:shadow-accent/30'
                    : 'cursor-not-allowed bg-surface-2 text-muted',
                )}
              >
                {mode === 'cursor' && nextItem ? `cursor=${nextItem.id}` : `page=${safePage + 2}`}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setPage(0)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                1
              </button>
              <span className="font-mono text-[0.7rem] text-muted">
                {slice.length}/{rows.length}
              </span>
            </div>
          </div>
        </div>

        {/* versioning */}
        <div className="mt-6 border-t border-border pt-5">
          <h4 className="font-display text-base font-semibold text-fg">{t.versionTitle}</h4>
          <p className="mt-1 text-sm text-muted">{t.versionSubtitle}</p>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {t.versions.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="rounded-xl border border-border bg-surface p-3"
              >
                <p className="text-[0.8rem] font-semibold text-fg">{v.label}</p>
                <code className="mt-1.5 block break-all rounded bg-surface-2 px-1.5 py-1 font-mono text-[0.65rem] text-accent">
                  {v.sample}
                </code>
                <p className="mt-2 text-[0.72rem] leading-snug text-fg/80">
                  <span className="font-mono text-[0.6rem] uppercase text-emerald-500">
                    {t.proLabel}{' '}
                  </span>
                  {v.pro}
                </p>
                <p className="mt-1.5 text-[0.72rem] leading-snug text-fg/80">
                  <span className="font-mono text-[0.6rem] uppercase text-amber-500">
                    {t.conLabel}{' '}
                  </span>
                  {v.con}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
