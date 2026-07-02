'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { rateLimitContent } from './content';
import { RlControls, RlStats, RlRateSlider, RlVerdictFeed } from './RlKit';

const CAPACITY = 6;
const LEAK_PER_SEC = 2;

export function RlLeakyBucket({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const lb = c.algos.leaky;
  const s = c.shared;

  const [rate, setRate] = useState(6);
  const [running, setRunning] = useState(false);
  const [level, setLevel] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [overflowFlash, setOverflowFlash] = useState(false);
  const [allowed, setAllowed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [feed, setFeed] = useState<{ id: number; ok: boolean }[]>([]);

  const levelRef = useRef(0);
  const outAccRef = useRef(0);
  const lastRef = useRef(Date.now());
  const idRef = useRef(0);

  function send() {
    const ok = levelRef.current < CAPACITY;
    if (ok) {
      levelRef.current = Math.min(CAPACITY, levelRef.current + 1);
      setLevel(levelRef.current);
      setAllowed((v) => v + 1);
    } else {
      setBlocked((v) => v + 1);
      setOverflowFlash(true);
      setTimeout(() => setOverflowFlash(false), 300);
    }
    const id = idRef.current++;
    setFeed((list) => [{ id, ok }, ...list].slice(0, 16));
  }

  // continuous leak (constant output rate)
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      const leak = LEAK_PER_SEC * dt;
      const before = levelRef.current;
      levelRef.current = Math.max(0, levelRef.current - leak);
      outAccRef.current += before - levelRef.current;
      if (outAccRef.current >= 1) {
        const whole = Math.floor(outAccRef.current);
        outAccRef.current -= whole;
        setProcessed((v) => v + whole);
      }
      setLevel(levelRef.current);
    }, 60);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(send, Math.round(1000 / rate));
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, rate]);

  function reset() {
    setRunning(false);
    levelRef.current = 0;
    outAccRef.current = 0;
    lastRef.current = Date.now();
    idRef.current = 0;
    setLevel(0);
    setProcessed(0);
    setAllowed(0);
    setBlocked(0);
    setFeed([]);
  }

  const fillPct = (level / CAPACITY) * 100;
  const full = level >= CAPACITY - 0.001;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <RlRateSlider value={rate} onChange={setRate} label={s.rate} unit={s.perSec} max={12} />
        <RlControls
          running={running}
          onToggle={() => setRunning((r) => !r)}
          onSend={send}
          onReset={reset}
          labels={s}
        />
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            {/* overflow splash */}
            {overflowFlash && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -10 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] font-bold text-rose-500"
              >
                overflow ✕
              </motion.div>
            )}
            <div
              className={cn(
                'relative h-40 w-24 overflow-hidden rounded-b-2xl rounded-t-md border-2 bg-surface-2 transition-colors',
                full ? 'border-rose-500/70' : 'border-border',
              )}
            >
              <motion.div
                className={cn('absolute inset-x-0 bottom-0', full ? 'bg-rose-500/70' : 'bg-accent/70')}
                animate={{ height: `${fillPct}%` }}
                transition={{ type: 'spring', stiffness: 140, damping: 22 }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-lg font-bold tabular-nums text-fg">
                  {Math.round(level)}/{CAPACITY}
                </span>
              </div>
            </div>
            {/* steady drip out the bottom */}
            <div className="mt-1 flex flex-col items-center">
              <motion.div
                animate={{ opacity: [0.2, 1, 0.2], y: [0, 6, 6] }}
                transition={{ duration: 60 / (LEAK_PER_SEC * 60), repeat: Infinity }}
              >
                <Droplets className="h-4 w-4 text-accent" aria-hidden />
              </motion.div>
            </div>
          </div>

          <div className="text-xs text-muted">
            <div className="font-mono uppercase tracking-wide">{lb.bucketLabel}</div>
            <div className="mt-1">
              {lb.leak}: <span className="font-semibold text-fg">{LEAK_PER_SEC}/s</span>
            </div>
            <div>
              cap: <span className="font-semibold text-fg">{CAPACITY}</span>
            </div>
            <div className="mt-1">
              {lb.outRate}: <span className="font-semibold text-emerald-500 tabular-nums">{processed}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="min-h-[1.25rem] text-xs font-medium">
            {full ? (
              <span className="text-rose-500">{lb.overflow}</span>
            ) : (
              <span className="text-muted">&nbsp;</span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{lb.hint}</p>
          <div className="mt-3 grid gap-3">
            <RlStats allowed={allowed} blocked={blocked} labels={s} />
            <div className="rounded-xl border border-border bg-surface p-3">
              <RlVerdictFeed feed={feed} label={s.verdict} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
