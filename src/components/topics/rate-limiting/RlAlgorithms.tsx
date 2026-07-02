'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, GaugeCircle, Coins, Droplets } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { rateLimitContent, type AlgoMeta } from './content';
import { RlHeading } from './RlKit';
import { RlFixedWindow } from './RlFixedWindow';
import { RlSlidingWindow } from './RlSlidingWindow';
import { RlTokenBucket } from './RlTokenBucket';
import { RlLeakyBucket } from './RlLeakyBucket';

const ICONS = {
  fixed: Clock,
  sliding: GaugeCircle,
  token: Coins,
  leaky: Droplets,
} as const;

export function RlAlgorithms({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const a = c.algos;
  const s = c.shared;
  const [tab, setTab] = useState<AlgoMeta['id']>('fixed');
  const meta = a.meta.find((x) => x.id === tab)!;

  return (
    <div className="not-prose">
      <RlHeading title={a.title} subtitle={a.subtitle} />

      {/* tabs */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {a.meta.map((mAlgo) => {
          const Icon = ICONS[mAlgo.id];
          const active = tab === mAlgo.id;
          return (
            <button
              key={mAlgo.id}
              type="button"
              onClick={() => setTab(mAlgo.id)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                active
                  ? 'border-accent bg-accent/[0.07]'
                  : 'border-border bg-surface hover:border-accent/40',
              )}
            >
              <span className={cn('flex items-center gap-1.5', active ? 'text-accent' : 'text-fg')}>
                <Icon className="h-4 w-4" aria-hidden />
                <span className="text-sm font-semibold">{mAlgo.name}</span>
              </span>
              <span className="text-[0.7rem] leading-tight text-muted">{mAlgo.tagline}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* the live sim */}
        <div className="rounded-2xl border border-border bg-surface/40 p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'fixed' && <RlFixedWindow locale={locale} />}
              {tab === 'sliding' && <RlSlidingWindow locale={locale} />}
              {tab === 'token' && <RlTokenBucket locale={locale} />}
              {tab === 'leaky' && <RlLeakyBucket locale={locale} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* meta card */}
        <motion.div
          key={`${tab}-meta`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="h-fit rounded-2xl border border-border bg-surface p-5"
        >
          <h4 className="font-display text-lg font-semibold text-fg">{meta.name}</h4>
          <p className="mt-0.5 text-sm text-muted">{meta.tagline}</p>
          <dl className="mt-4 space-y-3">
            <MetaRow label={s.keeps} value={meta.keeps} />
            <MetaRow label={s.decides} value={meta.decides} />
            <MetaRow label={s.goodFor} value={meta.goodFor} tone="emerald" />
            <MetaRow label={s.tradeoff} value={meta.tradeoff} tone="amber" />
          </dl>
        </motion.div>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'emerald' | 'amber';
}) {
  return (
    <div className="border-t border-border pt-3 first:border-0 first:pt-0">
      <dt
        className={cn(
          'font-mono text-[0.65rem] uppercase tracking-wide',
          tone === 'emerald' ? 'text-emerald-500' : tone === 'amber' ? 'text-amber-500' : 'text-muted',
        )}
      >
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-fg/85">{value}</dd>
    </div>
  );
}
