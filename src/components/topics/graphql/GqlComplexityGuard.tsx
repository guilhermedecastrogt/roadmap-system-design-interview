'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, CodeSurface, Segmented } from '../api-track/ApiKit';
import { graphqlContent } from './content';

const LIMIT = 5000;
const FIRST_OPTIONS = [10, 25, 100];
/** Which levels of the nesting path are list fields — those multiply the cost. */
const IS_LIST = [true, false, true, true, false];

/**
 * Cost analysis made tangible: nesting multiplies, so a query nobody would call
 * abusive can ask for millions of rows. Move the two controls and watch a
 * plausible query get rejected before it ever reaches the database.
 */
export function GqlComplexityGuard({ locale }: { locale: Locale }) {
  const t = graphqlContent[locale].guard;
  const [first, setFirst] = useState(10);
  const [depth, setDepth] = useState(3);

  const levels = t.depthNames.slice(0, depth);
  const listLevels = IS_LIST.slice(0, depth).filter(Boolean).length;
  const cost = Math.pow(first, listLevels);
  const rejected = cost > LIMIT;

  const query = [
    'query {',
    ...levels.map((name, i) => {
      const pad = '  '.repeat(i + 1);
      return `${pad}${name}${IS_LIST[i] ? `(first: ${first})` : ''} {`;
    }),
    `${'  '.repeat(depth + 1)}id`,
    ...levels.map((_, i) => `${'  '.repeat(depth - i)}}`),
    '}',
  ].join('\n');

  const breakdown = IS_LIST.slice(0, depth)
    .map((isList, i) => (isList ? String(first) : null))
    .filter(Boolean)
    .join(' × ');

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="space-y-3">
          <Segmented
            label={t.firstLabel}
            size="sm"
            value={String(first)}
            options={FIRST_OPTIONS.map((n) => ({ id: String(n), label: String(n) }))}
            onChange={(v: string) => setFirst(Number(v))}
          />

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
              {t.depthLabel}
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="h-1.5 w-40 cursor-pointer appearance-none rounded-full bg-surface-2 accent-violet-500"
              aria-label={t.depthLabel}
            />
            <span className="font-mono text-[0.72rem] font-bold text-violet-500">{depth}</span>
            <span className="font-mono text-[0.62rem] text-muted">
              {levels.join(' › ')}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <CodeSurface body={query} tone="violet" />

          <div
            className={cn(
              'flex flex-col justify-center rounded-xl border p-4 transition-colors',
              rejected
                ? 'border-rose-500/50 bg-rose-500/[0.07]'
                : 'border-emerald-500/50 bg-emerald-500/[0.07]',
            )}
          >
            <div className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">
              {t.costLabel}
            </div>
            <motion.div
              key={cost}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'font-display text-3xl font-bold',
                rejected ? 'text-rose-500' : 'text-emerald-500',
              )}
            >
              {cost.toLocaleString(locale)}
            </motion.div>
            <div className="mt-0.5 font-mono text-[0.65rem] text-muted">
              {breakdown || first} · {t.limitLabel} {LIMIT.toLocaleString(locale)}
            </div>

            {/* budget bar */}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className={cn('h-full rounded-full', rejected ? 'bg-rose-500' : 'bg-emerald-500')}
                animate={{ width: `${Math.min(100, (cost / LIMIT) * 100)}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            <p
              className={cn(
                'mt-3 inline-flex items-center gap-1.5 text-sm font-semibold',
                rejected ? 'text-rose-500' : 'text-emerald-500',
              )}
            >
              {rejected ? (
                <ShieldAlert className="h-4 w-4" aria-hidden />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden />
              )}
              {rejected ? t.rejected : t.accepted}
            </p>
            <p className="mt-1 text-[0.78rem] leading-relaxed text-fg/85">
              {rejected ? t.rejectedNote : t.acceptedNote}
            </p>
          </div>
        </div>

        {/* toolbox */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {t.tools.map((tool) => (
            <div key={tool.id} className="rounded-xl border border-border bg-surface p-3">
              <p className="text-[0.8rem] font-semibold text-fg">{tool.label}</p>
              <p className="mt-0.5 text-[0.72rem] leading-snug text-muted">{tool.what}</p>
            </div>
          ))}
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
