'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { rateLimitContent } from './content';
import { RlControls, RlStats, RlRateSlider, RlVerdictFeed } from './RlKit';

const WINDOW_MS = 3000;
const LIMIT = 5;

export function RlFixedWindow({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const f = c.algos.fixed;
  const s = c.shared;

  const [rate, setRate] = useState(3);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const [allowed, setAllowed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [feed, setFeed] = useState<{ id: number; ok: boolean }[]>([]);

  const startRef = useRef(Date.now());
  const countRef = useRef(0);
  const idRef = useRef(0);

  function sync(now: number) {
    if (now - startRef.current >= WINDOW_MS) {
      while (now - startRef.current >= WINDOW_MS) startRef.current += WINDOW_MS;
      countRef.current = 0;
      setCount(0);
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
    }
  }

  function send() {
    const now = Date.now();
    sync(now);
    const ok = countRef.current < LIMIT;
    if (ok) {
      countRef.current += 1;
      setCount(countRef.current);
      setAllowed((v) => v + 1);
    } else {
      setBlocked((v) => v + 1);
    }
    const id = idRef.current++;
    setFeed((list) => [{ id, ok }, ...list].slice(0, 16));
  }

  // continuous clock for the progress bar
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      sync(now);
      setProgress((now - startRef.current) / WINDOW_MS);
    }, 60);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(send, Math.round(1000 / rate));
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, rate]);

  function reset() {
    setRunning(false);
    startRef.current = Date.now();
    countRef.current = 0;
    idRef.current = 0;
    setCount(0);
    setProgress(0);
    setAllowed(0);
    setBlocked(0);
    setFeed([]);
  }

  const resetIn = ((WINDOW_MS * (1 - progress)) / 1000).toFixed(1);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <RlRateSlider value={rate} onChange={setRate} label={s.rate} unit={s.perSec} max={10} />
        <RlControls
          running={running}
          onToggle={() => setRunning((r) => !r)}
          onSend={send}
          onReset={reset}
          labels={s}
        />
      </div>

      {/* window slots */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wide text-muted">{f.windowLabel}</span>
          <span className="font-mono text-muted">
            {f.countLabel} <span className="font-bold text-fg">{count}</span>/{LIMIT} · {f.resetIn}{' '}
            <span className="tabular-nums">{resetIn}s</span>
          </span>
        </div>

        <div className="flex gap-1.5">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-9 flex-1 rounded-md border transition-colors duration-200',
                i < count
                  ? 'border-emerald-500/50 bg-emerald-500/80'
                  : 'border-border bg-surface-2',
              )}
            />
          ))}
        </div>

        {/* window time progress */}
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className={cn('h-full rounded-full', flash ? 'bg-amber-500' : 'bg-accent')}
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 h-4 text-center text-[0.7rem] font-medium">
          {flash ? (
            <span className="text-amber-500">{f.resetFlash}</span>
          ) : count >= LIMIT ? (
            <span className="text-rose-500">{f.burstWarn}</span>
          ) : (
            <span className="text-muted">&nbsp;</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.2fr]">
        <RlStats allowed={allowed} blocked={blocked} labels={s} />
        <div className="rounded-xl border border-border bg-surface p-3">
          <RlVerdictFeed feed={feed} label={s.verdict} />
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">{f.hint}</p>
    </div>
  );
}
