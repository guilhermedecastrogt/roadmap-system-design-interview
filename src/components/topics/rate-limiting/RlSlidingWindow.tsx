'use client';

import { useEffect, useRef, useState } from 'react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { rateLimitContent } from './content';
import { RlControls, RlStats, RlRateSlider, RlVerdictFeed } from './RlKit';

const WINDOW_MS = 3000;
const VIEW_MS = 4500;
const LIMIT = 5;

type Ev = { id: number; t: number; ok: boolean };

export function RlSlidingWindow({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const sw = c.algos.sliding;
  const s = c.shared;

  const [rate, setRate] = useState(3);
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [events, setEvents] = useState<Ev[]>([]);
  const [allowed, setAllowed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [feed, setFeed] = useState<{ id: number; ok: boolean }[]>([]);

  const allowedTimes = useRef<number[]>([]);
  const idRef = useRef(0);

  function send() {
    const t = Date.now();
    allowedTimes.current = allowedTimes.current.filter((x) => x > t - WINDOW_MS);
    const ok = allowedTimes.current.length < LIMIT;
    if (ok) {
      allowedTimes.current.push(t);
      setAllowed((v) => v + 1);
    } else {
      setBlocked((v) => v + 1);
    }
    const id = idRef.current++;
    setEvents((list) => [...list, { id, t, ok }].filter((e) => e.t > t - VIEW_MS));
    setFeed((list) => [{ id, ok }, ...list].slice(0, 16));
  }

  useEffect(() => {
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      setEvents((list) => list.filter((e) => e.t > n - VIEW_MS));
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
    allowedTimes.current = [];
    idRef.current = 0;
    setEvents([]);
    setAllowed(0);
    setBlocked(0);
    setFeed([]);
  }

  const xOf = (t: number) => ((t - (now - VIEW_MS)) / VIEW_MS) * 100;
  const windowLeft = xOf(now - WINDOW_MS);
  const inWindow = events.filter((e) => e.ok && e.t > now - WINDOW_MS).length;

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

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wide text-muted">{sw.timeline}</span>
          <span className="font-mono text-muted">
            {sw.windowLabel}: <span className="font-bold text-fg">{inWindow}</span>/{LIMIT} {sw.inWindow}
          </span>
        </div>

        {/* timeline track */}
        <div className="relative h-24 overflow-hidden rounded-lg border border-border bg-surface-2">
          {/* sliding window highlight (trailing WINDOW_MS up to now = right edge) */}
          <div
            className={cn(
              'absolute inset-y-0 right-0 border-l-2 transition-colors',
              inWindow >= LIMIT ? 'border-rose-500 bg-rose-500/10' : 'border-accent bg-accent/10',
            )}
            style={{ left: `${Math.max(0, windowLeft)}%` }}
          />
          {/* "now" edge label */}
          <div className="absolute right-1 top-1 font-mono text-[0.55rem] text-muted">now</div>
          <div
            className="absolute top-1 -translate-x-1/2 font-mono text-[0.55rem] text-muted"
            style={{ left: `${Math.max(4, windowLeft)}%` }}
          >
            −{(WINDOW_MS / 1000).toFixed(0)}s
          </div>

          {/* event dots */}
          {events.map((e) => {
            const x = xOf(e.t);
            const inside = e.ok && e.t > now - WINDOW_MS;
            return (
              <div
                key={e.id}
                className={cn(
                  'absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity',
                  e.ok
                    ? inside
                      ? 'bg-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-emerald-500/40'
                    : 'bg-rose-500',
                )}
                style={{ left: `${x}%` }}
              />
            );
          })}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">{sw.hint}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.2fr]">
        <RlStats allowed={allowed} blocked={blocked} labels={s} />
        <div className="rounded-xl border border-border bg-surface p-3">
          <RlVerdictFeed feed={feed} label={s.verdict} />
        </div>
      </div>
    </div>
  );
}
