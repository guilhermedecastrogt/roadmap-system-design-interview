'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, RotateCcw, Server, ShieldCheck } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { rateLimitContent, type RateLimitContent } from './content';

const CAPACITY = 100; // server can handle 100 units of load
const LIMIT = 60; // limiter caps load at 60
const TICK_MS = 90;

type Health = 'healthy' | 'degraded' | 'down';

function healthOf(load: number): Health {
  if (load >= CAPACITY) return 'down';
  if (load >= CAPACITY * 0.75) return 'degraded';
  return 'healthy';
}

export function RlNoLimitVsLimit({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const m = c.meltdown;

  const [incoming, setIncoming] = useState(0); // current offered load
  const [firing, setFiring] = useState(false);
  const [servedA, setServedA] = useState(0);
  const [servedB, setServedB] = useState(0);
  const [droppedB, setDroppedB] = useState(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!firing) return;
    const t = setInterval(() => {
      phaseRef.current += 1;
      // A flood that ramps up well past capacity, then eases.
      const p = phaseRef.current;
      const wave = Math.min(140, 20 + p * 6);
      setIncoming(wave);

      // Left server: accepts everything.
      setServedA((v) => v + wave / 10);
      // Right server: sheds everything over the limit.
      const accepted = Math.min(wave, LIMIT);
      setServedB((v) => v + accepted / 10);
      setDroppedB((v) => v + Math.max(0, wave - LIMIT) / 10);

      if (p > 40) setFiring(false);
    }, TICK_MS);
    return () => clearInterval(t);
  }, [firing]);

  function reset() {
    setFiring(false);
    setIncoming(0);
    setServedA(0);
    setServedB(0);
    setDroppedB(0);
    phaseRef.current = 0;
  }

  function fire() {
    reset();
    // start on next tick so reset lands first
    setTimeout(() => setFiring(true), 30);
  }

  const loadA = incoming; // no limit: full offered load hits the server
  const loadB = Math.min(incoming, LIMIT); // limited

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{m.title}</h3>
      <p className="mt-1 max-w-3xl text-sm text-muted">{m.subtitle}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={fire}
          disabled={firing}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-60"
        >
          <Flame className="h-4 w-4" aria-hidden />
          {firing ? m.firing : m.fire}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {m.reset}
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ServerPanel
          title={m.noLimit}
          subtitle={m.noLimitSub}
          load={loadA}
          served={Math.round(servedA)}
          dropped={null}
          protectedServer={false}
          labels={m}
        />
        <ServerPanel
          title={m.withLimit}
          subtitle={m.withLimitSub}
          load={loadB}
          served={Math.round(servedB)}
          dropped={Math.round(droppedB)}
          protectedServer
          labels={m}
        />
      </div>

      <p className="mt-4 rounded-lg border border-accent/30 bg-accent/[0.06] p-3 text-xs leading-relaxed text-fg/90">
        {m.note}
      </p>
    </div>
  );
}

function ServerPanel({
  title,
  subtitle,
  load,
  served,
  dropped,
  protectedServer,
  labels,
}: {
  title: string;
  subtitle: string;
  load: number;
  served: number;
  dropped: number | null;
  protectedServer: boolean;
  labels: RateLimitContent['meltdown'];
}) {
  const health = healthOf(load);
  const pct = Math.min(100, (load / 140) * 100);
  const capPct = (CAPACITY / 140) * 100;

  const tone =
    health === 'down' ? 'rose' : health === 'degraded' ? 'amber' : 'emerald';
  const barColor =
    health === 'down' ? 'bg-rose-500' : health === 'degraded' ? 'bg-amber-500' : 'bg-emerald-500';
  const healthLabel =
    health === 'down' ? labels.down : health === 'degraded' ? labels.degraded : labels.healthy;

  return (
    <div
      className={cn(
        'rounded-2xl border bg-surface p-5 transition-colors',
        health === 'down' && !protectedServer ? 'border-rose-500/60' : 'border-border',
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {protectedServer ? (
            <ShieldCheck className="h-5 w-5 text-accent" aria-hidden />
          ) : (
            <Server className="h-5 w-5 text-muted" aria-hidden />
          )}
          <div>
            <div className="font-display text-base font-semibold text-fg">{title}</div>
            <div className="font-mono text-[0.65rem] uppercase tracking-wide text-muted">
              {subtitle}
            </div>
          </div>
        </div>
        <motion.span
          animate={health === 'down' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold',
            tone === 'rose'
              ? 'bg-rose-500/15 text-rose-500'
              : tone === 'amber'
                ? 'bg-amber-500/15 text-amber-500'
                : 'bg-emerald-500/15 text-emerald-500',
          )}
        >
          <Activity className="h-3 w-3" aria-hidden />
          {healthLabel}
        </motion.span>
      </div>

      {/* load bar with a capacity marker */}
      <div className="relative h-6 overflow-hidden rounded-lg border border-border bg-surface-2">
        <motion.div
          className={cn('h-full', barColor)}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        {/* capacity line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-fg/50"
          style={{ left: `${capPct}%` }}
          aria-hidden
        />
        <div
          className="absolute top-0.5 -translate-x-1/2 font-mono text-[0.55rem] text-fg/60"
          style={{ left: `${capPct}%` }}
        >
          cap
        </div>
      </div>
      <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
        {labels.load}: {Math.round(load)}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-border bg-surface-2 p-2">
          <div className="font-mono text-base font-bold tabular-nums text-emerald-500">{served}</div>
          <div className="text-[0.55rem] uppercase tracking-wide text-muted">{labels.served}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 p-2">
          <div
            className={cn(
              'font-mono text-base font-bold tabular-nums',
              dropped === null ? 'text-muted' : 'text-rose-500',
            )}
          >
            {dropped === null ? '—' : dropped}
          </div>
          <div className="text-[0.55rem] uppercase tracking-wide text-muted">{labels.dropped}</div>
        </div>
      </div>

      <p className="mt-3 min-h-[2.5rem] text-xs leading-relaxed text-muted">
        {protectedServer ? labels.protectNote : labels.meltNote}
      </p>
    </div>
  );
}
