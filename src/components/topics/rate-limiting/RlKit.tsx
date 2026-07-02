'use client';

import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Plus, RotateCcw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared control bar reused by every algorithm sim. */
export function RlControls({
  running,
  onToggle,
  onSend,
  onBurst,
  onReset,
  labels,
}: {
  running: boolean;
  onToggle: () => void;
  onSend: () => void;
  onBurst?: () => void;
  onReset: () => void;
  labels: { run: string; pause: string; send: string; burst: string; reset: string };
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30"
      >
        {running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4 fill-current" aria-hidden />}
        {running ? labels.pause : labels.run}
      </button>
      <button
        type="button"
        onClick={onSend}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {labels.send}
      </button>
      {onBurst && (
        <button
          type="button"
          onClick={onBurst}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        >
          <Zap className="h-4 w-4 text-amber-500" aria-hidden />
          {labels.burst}
        </button>
      )}
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        {labels.reset}
      </button>
    </div>
  );
}

/** Compact allowed / blocked / block-rate stat strip. */
export function RlStats({
  allowed,
  blocked,
  labels,
}: {
  allowed: number;
  blocked: number;
  labels: { allowed: string; blocked: string; blockRate: string };
}) {
  const total = allowed + blocked;
  const pct = total === 0 ? 0 : Math.round((blocked / total) * 100);
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface p-3 text-center">
      <Stat value={allowed} label={labels.allowed} tone="emerald" />
      <Stat value={blocked} label={labels.blocked} tone="rose" />
      <Stat value={`${pct}%`} label={labels.blockRate} />
    </div>
  );
}

export function Stat({
  value,
  label,
  tone,
}: {
  value: ReactNode;
  label: string;
  tone?: 'emerald' | 'rose' | 'amber';
}) {
  return (
    <div>
      <div
        className={cn(
          'font-mono text-lg font-bold tabular-nums',
          tone === 'emerald'
            ? 'text-emerald-500'
            : tone === 'rose'
              ? 'text-rose-500'
              : tone === 'amber'
                ? 'text-amber-500'
                : 'text-fg',
        )}
      >
        {value}
      </div>
      <div className="text-[0.6rem] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

/** Rolling feed of the most recent allow/block verdicts, newest on the left. */
export function RlVerdictFeed({ feed, label }: { feed: { id: number; ok: boolean }[]; label: string }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[0.65rem] uppercase tracking-wide text-muted">{label}</div>
      <div className="flex h-6 items-center gap-1 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {feed.map((f) => (
            <motion.span
              key={f.id}
              layout
              initial={{ opacity: 0, scale: 0.4, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'h-4 w-4 shrink-0 rounded-full',
                f.ok ? 'bg-emerald-500' : 'bg-rose-500',
              )}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Labelled request-rate slider. */
export function RlRateSlider({
  value,
  onChange,
  min = 1,
  max = 12,
  label,
  unit,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-border accent-accent"
        aria-label={label}
      />
      <span className="w-12 font-mono text-sm font-semibold tabular-nums text-fg">
        {value}
        {unit}
      </span>
    </div>
  );
}

/** Small heading used above each sub-simulation. */
export function RlHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
