'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { rateLimitContent } from './content';
import { RlControls, RlStats, RlRateSlider, RlVerdictFeed } from './RlKit';

const CAPACITY = 6;
const REFILL_PER_SEC = 2;

export function RlTokenBucket({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const tb = c.algos.token;
  const s = c.shared;

  const [rate, setRate] = useState(4);
  const [running, setRunning] = useState(false);
  const [tokens, setTokens] = useState(CAPACITY);
  const [allowed, setAllowed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [feed, setFeed] = useState<{ id: number; ok: boolean }[]>([]);
  const [spend, setSpend] = useState(0);

  const tokensRef = useRef(CAPACITY);
  const lastRef = useRef(Date.now());
  const idRef = useRef(0);

  function send() {
    const ok = tokensRef.current >= 1;
    if (ok) {
      tokensRef.current -= 1;
      setTokens(tokensRef.current);
      setAllowed((v) => v + 1);
      setSpend((v) => v + 1);
    } else {
      setBlocked((v) => v + 1);
    }
    const id = idRef.current++;
    setFeed((list) => [{ id, ok }, ...list].slice(0, 16));
  }

  // continuous refill
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      tokensRef.current = Math.min(CAPACITY, tokensRef.current + REFILL_PER_SEC * dt);
      setTokens(tokensRef.current);
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
    tokensRef.current = CAPACITY;
    lastRef.current = Date.now();
    idRef.current = 0;
    setTokens(CAPACITY);
    setAllowed(0);
    setBlocked(0);
    setFeed([]);
    setSpend(0);
  }

  const fillPct = (tokens / CAPACITY) * 100;
  const empty = tokens < 1;

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

      <div className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[auto_1fr] sm:items-center">
        {/* the bucket */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative h-40 w-24 overflow-hidden rounded-b-2xl rounded-t-md border-2 border-border bg-surface-2">
            <motion.div
              className={cn('absolute inset-x-0 bottom-0', empty ? 'bg-rose-500/70' : 'bg-accent/70')}
              animate={{ height: `${fillPct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
            {/* integer token markers */}
            <div className="absolute inset-0 flex flex-col-reverse">
              {Array.from({ length: CAPACITY }).map((_, i) => (
                <div key={i} className="flex-1 border-t border-border/40 first:border-t-0" />
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center text-fg">
                <Coins className="h-5 w-5" aria-hidden />
                <span className="font-mono text-lg font-bold tabular-nums">{tokens.toFixed(1)}</span>
                <span className="text-[0.55rem] uppercase tracking-wide text-muted">{tb.tokens}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted">
            <div className="font-mono uppercase tracking-wide">{tb.bucketLabel}</div>
            <div className="mt-1">
              {tb.refill}: <span className="font-semibold text-fg">{REFILL_PER_SEC}/s</span>
            </div>
            <div>
              cap: <span className="font-semibold text-fg">{CAPACITY}</span>
            </div>
            <div className="mt-1">
              spent: <span className="font-semibold text-fg tabular-nums">{spend}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="min-h-[1.25rem] text-xs font-medium">
            {empty ? (
              <span className="text-rose-500">{tb.empty}</span>
            ) : (
              <span className="text-muted">&nbsp;</span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{tb.hint}</p>
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
