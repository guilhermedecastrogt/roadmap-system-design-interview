'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Globe, Send, Server, Timer, Zap } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SceneRails, Packet, type Pt } from '../cdn/scene';
import { cacheContent } from './content';

type Mode = 'without' | 'with';
type Phase = 'idle' | 'running';
type Result = 'without' | 'hit' | 'miss';

const PTS: Record<string, Pt> = {
  client: { x: 8, y: 55 },
  backend: { x: 44, y: 55 },
  cache: { x: 44, y: 18 },
  database: { x: 87, y: 55 },
};
const AMBER = 'rgb(245 158 11)';
const EMERALD = 'rgb(16 185 129)';
const TTL_TOTAL = 15;

export function CacheLab({ locale }: { locale: Locale }) {
  const c = cacheContent[locale].lab;
  const [mode, setMode] = useState<Mode>('without');
  const [phase, setPhase] = useState<Phase>('idle');
  const [ttl, setTtl] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [last, setLast] = useState<{ type: Result; ms: number } | null>(null);
  const [stats, setStats] = useState({ total: 0, db: 0, hits: 0, misses: 0 });
  const pending = useRef<{ type: Result; ms: number; points: Pt[]; color: string; dur: number; cache: boolean } | null>(null);

  const cached = ttl > 0;

  useEffect(() => {
    if (ttl <= 0) return;
    const t = setInterval(() => setTtl((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [ttl]);

  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setPhase('idle');
    setLast(null);
  }

  function send() {
    if (phase === 'running') return;
    const toDb = (): Pt[] => [PTS.client, PTS.backend, PTS.database, PTS.backend, PTS.client];
    const toCache = (): Pt[] => [PTS.client, PTS.backend, PTS.cache, PTS.backend, PTS.client];

    let p: typeof pending.current;
    if (mode === 'without') {
      p = { type: 'without', ms: 200 + Math.floor(Math.random() * 40), points: toDb(), color: AMBER, dur: 1.9, cache: false };
      setStats((s) => ({ ...s, total: s.total + 1, db: s.db + 1 }));
    } else if (cached) {
      p = { type: 'hit', ms: 9 + Math.floor(Math.random() * 12), points: toCache(), color: EMERALD, dur: 0.85, cache: false };
      setStats((s) => ({ ...s, total: s.total + 1, hits: s.hits + 1 }));
    } else {
      p = { type: 'miss', ms: 170 + Math.floor(Math.random() * 40), points: toDb(), color: AMBER, dur: 1.7, cache: true };
      setStats((s) => ({ ...s, total: s.total + 1, db: s.db + 1, misses: s.misses + 1 }));
    }
    pending.current = p;
    setLast(null);
    setPhase('running');
    setRunKey((k) => k + 1);
  }

  function onArrive() {
    const p = pending.current;
    if (!p) return;
    setLast({ type: p.type, ms: p.ms });
    if (p.cache) setTtl(TTL_TOTAL);
    setPhase('idle');
  }

  function reset() {
    setPhase('idle');
    setTtl(0);
    setLast(null);
    setStats({ total: 0, db: 0, hits: 0, misses: 0 });
    pending.current = null;
  }

  const hitRate = stats.total ? Math.round((stats.hits / stats.total) * 100) : 0;
  const resultColor = last?.type === 'hit' ? EMERALD : AMBER;
  const resultText = last
    ? last.type === 'hit'
      ? c.hitText
      : last.type === 'miss'
        ? c.missText
        : c.withoutText
    : mode === 'without'
      ? c.withoutText
      : cached
        ? c.hitText
        : c.missText;

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={send}
              disabled={phase === 'running'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-70"
            >
              <Send className="h-4 w-4" aria-hidden />
              {phase === 'running' ? c.sending : c.send}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {c.reset}
            </button>
          </div>
        </div>

        {/* canvas */}
        <div className="overflow-x-auto">
          <div className="relative h-[15rem] min-w-[560px]">
            <SceneRails
              edges={[
                { a: PTS.client, b: PTS.backend },
                { a: PTS.backend, b: PTS.cache, active: mode === 'with' },
                { a: PTS.backend, b: PTS.database },
              ]}
            />

            <NodeBox pt={PTS.client} icon={Globe} label={c.client} />
            <NodeBox pt={PTS.backend} icon={Server} label={c.backend} />

            {/* cache node (only meaningful with cache on) */}
            <NodeBox
              pt={PTS.cache}
              icon={Zap}
              label={c.cache}
              dim={mode === 'without'}
              active={cached}
              badge={cached ? c.cached : undefined}
            >
              {cached && (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between font-mono text-[0.6rem] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Timer className="h-3 w-3" aria-hidden />
                      {c.ttl}
                    </span>
                    <span className="text-fg/80">{ttl}s</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      animate={{ width: `${(ttl / TTL_TOTAL) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
                </div>
              )}
            </NodeBox>

            <NodeBox pt={PTS.database} icon={Database} label={c.database}>
              <p className="mt-1 text-center font-mono text-[0.6rem] text-muted">
                {stats.db} {c.dbQueries}
              </p>
            </NodeBox>

            {phase === 'running' && pending.current && (
              <Packet
                key={runKey}
                points={pending.current.points}
                color={pending.current.color}
                duration={pending.current.dur}
                onDone={onArrive}
              />
            )}
          </div>
        </div>

        {/* result + stats */}
        <div className="mt-5 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted">{resultText}</span>
              <AnimatePresence mode="wait">
                {last && (
                  <motion.span
                    key={`${last.type}-${last.ms}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-lg font-bold tabular-nums"
                    style={{ color: resultColor }}
                  >
                    ~{last.ms} ms
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full"
                style={{ background: resultColor }}
                animate={{ width: last ? `${Math.min(100, (last.ms / 250) * 100)}%` : '0%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {last && (
              <span
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: resultColor }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: resultColor }} />
                {last.type === 'hit' ? c.hit : last.type === 'miss' ? c.miss : c.without}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface p-3 text-center">
            <Stat value={stats.total} label={c.total} />
            <Stat value={stats.db} label={c.dbQueries} />
            <Stat value={`${hitRate}%`} label={c.hitRate} />
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">{c.note}</p>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="font-mono text-lg font-bold tabular-nums text-fg">{value}</div>
      <div className="text-[0.6rem] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

function NodeBox({
  pt,
  icon: Icon,
  label,
  active,
  dim,
  badge,
  children,
}: {
  pt: Pt;
  icon: typeof Globe;
  label: string;
  active?: boolean;
  dim?: boolean;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'absolute z-[5] w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface p-2.5 text-center transition-opacity',
        active ? 'border-accent shadow-md shadow-accent/20' : 'border-border',
        dim && 'opacity-40',
      )}
      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
    >
      {badge && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
          {badge}
        </span>
      )}
      <div className="flex items-center justify-center gap-1.5">
        <Icon className={cn('h-4 w-4', active ? 'text-accent' : 'text-muted')} aria-hidden />
        <span className="text-xs font-semibold text-fg">{label}</span>
      </div>
      {children}
    </div>
  );
}
