'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type Locale } from '@/i18n/routing';
import { ApiHeading, ApiNote, ApiPanel, toneBg, toneBorder, toneText, type Tone } from './ApiKit';
import { trackContent, type TrackStyleId } from './trackContent';

const STYLE_TONE: Record<TrackStyleId, Tone> = {
  rest: 'sky',
  webhooks: 'amber',
  graphql: 'violet',
  grpc: 'emerald',
};

const STYLE_IDS: TrackStyleId[] = ['rest', 'webhooks', 'graphql', 'grpc'];

/**
 * The track-wide comparison: seven dimensions asked of REST, webhooks, GraphQL
 * and gRPC. Focusing one style dims the rest so a single column can be read top
 * to bottom without the eye wandering.
 */
export function ApiStyleCompare({ locale }: { locale: Locale }) {
  const c = trackContent[locale].compare;
  const [focus, setFocus] = useState<TrackStyleId | null>(null);

  return (
    <div className="not-prose">
      <ApiHeading title={c.title} subtitle={c.subtitle} />

      <ApiPanel>
        {/* focus control */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
            {c.focusHint}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_IDS.map((id) => {
              const on = focus === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFocus(on ? null : id)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    on
                      ? cn(toneBorder[STYLE_TONE[id]], toneBg[STYLE_TONE[id]], toneText[STYLE_TONE[id]])
                      : 'border-border text-muted hover:text-fg',
                  )}
                >
                  {c.styles[id]}
                </button>
              );
            })}
            {focus && (
              <button
                type="button"
                onClick={() => setFocus(null)}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-fg"
              >
                {c.allLabel}
              </button>
            )}
          </div>
        </div>

        {/* header (desktop only) */}
        <div className="hidden grid-cols-[8.5rem_repeat(4,1fr)] gap-2 border-b border-border pb-2 sm:grid">
          <span />
          {STYLE_IDS.map((id) => (
            <span
              key={id}
              className={cn(
                'font-display text-sm font-bold transition-opacity',
                toneText[STYLE_TONE[id]],
                focus && focus !== id && 'opacity-35',
              )}
            >
              {c.styles[id]}
            </span>
          ))}
        </div>

        {/* rows */}
        <div className="divide-y divide-border">
          {c.dimensions.map((dim, i) => (
            <motion.div
              key={dim.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: Math.min(i, 4) * 0.04 }}
              className="grid gap-1.5 py-3 sm:grid-cols-[8.5rem_repeat(4,1fr)] sm:gap-2"
            >
              <span className="font-mono text-[0.65rem] uppercase tracking-wide text-muted">
                {dim.label}
              </span>
              {STYLE_IDS.map((id) => (
                <div
                  key={id}
                  className={cn(
                    'rounded-lg px-2 py-1.5 text-[0.78rem] leading-snug transition-all sm:bg-transparent sm:px-0',
                    focus === id ? cn(toneBg[STYLE_TONE[id]], 'sm:bg-transparent') : 'bg-surface-2/40',
                    focus && focus !== id ? 'text-muted opacity-40' : 'text-fg/85',
                  )}
                >
                  <span
                    className={cn(
                      'mr-1.5 font-mono text-[0.6rem] font-bold uppercase sm:hidden',
                      toneText[STYLE_TONE[id]],
                    )}
                  >
                    {c.styles[id]}
                  </span>
                  {dim.values[id]}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </ApiPanel>

      <ApiNote>{c.note}</ApiNote>
    </div>
  );
}
