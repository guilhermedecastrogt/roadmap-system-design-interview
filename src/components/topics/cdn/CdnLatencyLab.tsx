'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Send, Server, Warehouse } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { cdnContent } from './content';

const USER = 9;
const EDGE = 34;
const ORIGIN = 91;

type Mode = 'without' | 'with';
type Phase = 'idle' | 'running' | 'done';

export function CdnLatencyLab({ locale }: { locale: Locale }) {
  const c = cdnContent[locale].latency;
  const [mode, setMode] = useState<Mode>('without');
  const [phase, setPhase] = useState<Phase>('idle');
  const [runKey, setRunKey] = useState(0);

  const target = mode === 'with' ? EDGE : ORIGIN;
  const duration = mode === 'with' ? 1.0 : 2.4;
  const ms = mode === 'with' ? 24 : 180;
  const barPct = mode === 'with' ? 14 : 100;
  const color = mode === 'with' ? 'rgb(16 185 129)' : 'rgb(245 158 11)';

  function run() {
    setPhase('running');
    setRunKey((k) => k + 1);
  }
  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setPhase('idle');
  }

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(['without', 'with'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === m ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {m === 'with' ? c.with : c.without}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={run}
            disabled={phase === 'running'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-70"
          >
            <Send className="h-4 w-4" aria-hidden />
            {phase === 'running' ? c.running : c.run}
          </button>
        </div>

        {/* map */}
        <div className="relative h-28">
          {/* faint full rail */}
          <div
            className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-border"
            style={{ left: `${USER}%`, width: `${ORIGIN - USER}%` }}
          />
          {/* active rail */}
          <motion.div
            className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full"
            style={{ left: `${USER}%`, background: color }}
            animate={{ width: `${target - USER}%` }}
            transition={{ duration: 0.4 }}
          />

          <Marker pos={USER} icon={Globe} label={c.user} active />
          <Marker
            pos={EDGE}
            icon={Server}
            label={c.edge}
            active={mode === 'with'}
            dim={mode === 'without'}
          />
          <Marker
            pos={ORIGIN}
            icon={Warehouse}
            label={c.origin}
            active={mode === 'without'}
            dim={mode === 'with'}
          />

          {/* packet */}
          <AnimatePresence>
            {phase !== 'idle' && (
              <motion.div
                key={runKey}
                className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: color, boxShadow: `0 0 14px ${color}` }}
                initial={{ left: `${USER}%` }}
                animate={{ left: [`${USER}%`, `${target}%`, `${USER}%`] }}
                transition={{ duration, times: [0, 0.5, 1], ease: 'easeInOut' }}
                onAnimationComplete={() => setPhase('done')}
              />
            )}
          </AnimatePresence>
        </div>

        {/* result */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {mode === 'with' ? c.rttEdge : c.rttOrigin}
          </p>
          <AnimatePresence mode="wait">
            {phase === 'done' && (
              <motion.span
                key={`${mode}-${ms}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-lg font-bold tabular-nums"
                style={{ color }}
              >
                ~{ms} ms
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            animate={{ width: phase === 'done' ? `${barPct}%` : '0%' }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">{c.note}</p>
      </div>
    </div>
  );
}

function Marker({
  pos,
  icon: Icon,
  label,
  active,
  dim,
}: {
  pos: number;
  icon: typeof Globe;
  label: string;
  active?: boolean;
  dim?: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          'absolute top-1/2 z-[5] grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-surface transition-opacity',
          active ? 'border-accent text-accent shadow-md shadow-accent/20' : 'border-border text-muted',
          dim && 'opacity-40',
        )}
        style={{ left: `${pos}%` }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <span
        className={cn(
          'absolute -translate-x-1/2 whitespace-nowrap text-center font-mono text-[0.7rem]',
          active ? 'text-fg' : 'text-muted',
          dim && 'opacity-50',
        )}
        style={{ left: `${pos}%`, top: 'calc(50% + 1.9rem)' }}
      >
        {label}
      </span>
    </>
  );
}
