'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, CodeSurface, Segmented } from '../api-track/ApiKit';
import { fetchModes, graphqlContent, type FetchModeId } from './content';

const MAX_BYTES = Math.max(...Object.values(fetchModes).map((m) => m.bytes));

const TONE: Record<FetchModeId, { text: string; bg: string; border: string }> = {
  overfetch: { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500' },
  underfetch: { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500' },
  graphql: { text: 'text-violet-500', bg: 'bg-violet-500', border: 'border-violet-500' },
};

/**
 * The same screen fetched three ways, with the two numbers that actually differ
 * — round trips and bytes — put side by side. It deliberately refuses to crown
 * a winner: the third row shows where the cost went, not that it disappeared.
 */
export function GqlFetchCompare({ locale }: { locale: Locale }) {
  const c = graphqlContent[locale];
  const t = c.fetching;
  const [modeId, setModeId] = useState<FetchModeId>('overfetch');

  const mode = t.modes.find((m) => m.id === modeId)!;
  const data = fetchModes[modeId];
  const tone = TONE[modeId];

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <Segmented
          value={modeId}
          options={t.modes.map((m) => ({
            id: m.id,
            label: m.label,
            tone: m.id === 'graphql' ? ('violet' as const) : ('amber' as const),
          }))}
          onChange={(next: FetchModeId) => setModeId(next)}
        />

        <p className={cn('mt-4 font-display text-base font-semibold', tone.text)}>
          {mode.headline}
        </p>

        {/* round trips */}
        <div className="mt-3 rounded-xl border border-border bg-surface p-3.5">
          <div className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">
            {t.roundTripsLabel}
          </div>
          <div className="mt-2.5 space-y-1.5">
            {Array.from({ length: data.requests }, (_, i) => (
              <motion.div
                key={`${modeId}-${i}`}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ duration: 0.35, delay: i * 0.25 }}
                className="flex items-center gap-2"
                style={{ paddingLeft: `${i * 12}%` }}
              >
                <span className="font-mono text-[0.6rem] text-muted">{i + 1}</span>
                <div
                  className={cn(
                    'flex h-5 flex-1 items-center gap-1 rounded-md px-2 text-[0.6rem] font-semibold text-white',
                    tone.bg,
                  )}
                >
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-4">
            <Metric label={t.requestsLabel} value={String(data.requests)} tone={tone.text} />
            <Metric label={t.bytesLabel} value={`${data.bytes} B`} tone={tone.text} />
          </div>
          {/* bytes bar */}
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              key={modeId}
              className={cn('h-full rounded-full', tone.bg)}
              initial={{ width: 0 }}
              animate={{ width: `${(data.bytes / MAX_BYTES) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <CodeSurface
            body={data.sample}
            tone={modeId === 'graphql' ? 'violet' : 'amber'}
          />
          <p className="rounded-xl border border-border bg-surface p-3.5 text-[0.82rem] leading-relaxed text-fg/85">
            {mode.explain}
          </p>
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="font-mono text-[0.58rem] uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('font-display text-lg font-bold', tone)}>{value}</div>
    </div>
  );
}
