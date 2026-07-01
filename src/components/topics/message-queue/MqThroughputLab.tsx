'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Layers, Mail, Pause, Play, RotateCcw, Send, Zap } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { messageQueueContent } from './content';

const RATES = [1, 3, 6];
const MAX_VISIBLE = 26;
const CONSUMER_MS = 1000;

type Msg = { id: number };

export function MqThroughputLab({ locale }: { locale: Locale }) {
  const c = messageQueueContent[locale].lab;
  const [queue, setQueue] = useState<Msg[]>([]);
  const [produced, setProduced] = useState(0);
  const [consumed, setConsumed] = useState(0);
  const [peak, setPeak] = useState(0);
  const [rate, setRate] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [pulse, setPulse] = useState<'in' | 'out' | null>(null);
  const idRef = useRef(0);

  // Producer — enqueues at the chosen rate while running.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => enqueue(1), Math.round(1000 / rate));
    return () => clearInterval(t);
  }, [playing, rate]);

  // Consumer — drains one message per second, always.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setQueue((q) => {
        if (q.length === 0) return q;
        setConsumed((n) => n + 1);
        setPulse('out');
        return q.slice(1);
      });
    }, CONSUMER_MS);
    return () => clearInterval(t);
  }, [playing]);

  // Track the deepest the backlog ever got.
  useEffect(() => {
    setPeak((p) => (queue.length > p ? queue.length : p));
  }, [queue.length]);

  function enqueue(count: number) {
    setQueue((q) => {
      const next = [...q];
      for (let i = 0; i < count; i++) next.push({ id: idRef.current++ });
      return next;
    });
    setProduced((n) => n + count);
    setPulse('in');
  }

  function reset() {
    setPlaying(false);
    setQueue([]);
    setProduced(0);
    setConsumed(0);
    setPeak(0);
    setPulse(null);
    idRef.current = 0;
  }

  const depth = queue.length;
  const overflowing = depth > MAX_VISIBLE;
  const visible = overflowing ? queue.slice(-MAX_VISIBLE) : queue;
  const backingUp = depth >= 3;

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 max-w-3xl text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
              {c.rate}
            </span>
            <div className="inline-flex rounded-lg border border-border bg-surface p-1">
              {RATES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRate(r)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-sm font-medium tabular-nums transition-colors',
                    rate === r ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                  )}
                >
                  {r}/s
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30"
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4 fill-current" aria-hidden />}
              {playing ? c.pause : c.play}
            </button>
            <button
              type="button"
              onClick={() => enqueue(8)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
            >
              <Zap className="h-4 w-4 text-amber-500" aria-hidden />
              {c.burst}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {c.reset}
            </button>
          </div>
        </div>

        {/* stage */}
        <div className="grid grid-cols-[1fr_auto_1.4fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* producer */}
          <Endpoint
            icon={Send}
            label={c.producer}
            sub={c.producerSub}
            active={playing}
            pulsing={pulse === 'in'}
            tone="accent"
          />

          <Arrow active={playing} />

          {/* queue column */}
          <div
            className={cn(
              'relative flex h-56 flex-col justify-end overflow-hidden rounded-xl border bg-surface p-2 transition-colors',
              backingUp ? 'border-amber-500/60 shadow-md shadow-amber-500/10' : 'border-border',
            )}
          >
            <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex items-center justify-center gap-1.5 text-muted">
              <Layers className="h-3.5 w-3.5" aria-hidden />
              <span className="font-mono text-[0.65rem] uppercase tracking-wide">{c.queue}</span>
            </div>
            {overflowing && (
              <div className="pointer-events-none absolute inset-x-0 top-7 z-10 text-center font-mono text-[0.6rem] text-amber-500">
                +{depth - MAX_VISIBLE}
              </div>
            )}
            <div className="flex flex-col-reverse items-stretch gap-1">
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    className={cn(
                      'flex h-5 items-center justify-center gap-1 rounded-md text-white',
                      backingUp ? 'bg-amber-500' : 'bg-accent',
                    )}
                  >
                    <Mail className="h-3 w-3" aria-hidden />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <Arrow active={playing && depth > 0} tone={backingUp ? 'amber' : 'accent'} />

          {/* consumer */}
          <Endpoint
            icon={Cpu}
            label={c.consumer}
            sub={c.consumerSub}
            active={playing && depth > 0}
            pulsing={pulse === 'out'}
            tone="emerald"
          />
        </div>

        {/* status line */}
        <div className="mt-4 min-h-[1.25rem] text-center text-xs font-medium">
          {depth === 0 ? (
            <span className="text-muted">{c.emptyHint}</span>
          ) : backingUp ? (
            <span className="text-amber-500">{c.overflowNote}</span>
          ) : (
            <span className="text-muted">&nbsp;</span>
          )}
        </div>

        {/* stats */}
        <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl border border-border bg-surface p-3 text-center">
          <Stat value={produced} label={c.produced} />
          <Stat value={depth} label={c.inQueue} tone={backingUp ? 'amber' : undefined} />
          <Stat value={consumed} label={c.consumed} tone="emerald" />
          <Stat value={peak} label={c.peak} />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">{c.note}</p>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone?: 'amber' | 'emerald';
}) {
  return (
    <div>
      <div
        className={cn(
          'font-mono text-lg font-bold tabular-nums',
          tone === 'amber' ? 'text-amber-500' : tone === 'emerald' ? 'text-emerald-500' : 'text-fg',
        )}
      >
        {value}
      </div>
      <div className="text-[0.6rem] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

function Endpoint({
  icon: Icon,
  label,
  sub,
  active,
  pulsing,
  tone,
}: {
  icon: typeof Send;
  label: string;
  sub: string;
  active?: boolean;
  pulsing?: boolean;
  tone: 'accent' | 'emerald';
}) {
  const ring = tone === 'emerald' ? 'text-emerald-500' : 'text-accent';
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <motion.div
        animate={{ scale: pulsing ? 1.12 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className={cn(
          'grid h-12 w-12 place-items-center rounded-xl border bg-surface transition-colors',
          active ? cn('border-current shadow-md', ring) : 'border-border text-muted',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </motion.div>
      <div>
        <div className="text-xs font-semibold text-fg">{label}</div>
        <div className="font-mono text-[0.6rem] text-muted">{sub}</div>
      </div>
    </div>
  );
}

function Arrow({ active, tone = 'accent' }: { active?: boolean; tone?: 'accent' | 'amber' }) {
  const color = tone === 'amber' ? 'rgb(245 158 11)' : 'rgb(var(--accent))';
  return (
    <div className="flex h-6 w-full min-w-[1.25rem] items-center">
      <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-border">
        {active && (
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full"
            style={{ background: color }}
            animate={{ left: ['-33%', '100%'] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
    </div>
  );
}
