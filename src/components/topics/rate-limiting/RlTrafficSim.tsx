'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Server, ShieldCheck } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { rateLimitContent } from './content';
import { RlControls, RlStats, RlRateSlider, RlHeading } from './RlKit';

const LIMIT = 5; // requests per second the limiter allows through
const TRAVEL_MS = 1500;

type Packet = { id: number; ok: boolean };

export function RlTrafficSim({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const t = c.traffic;
  const s = c.shared;

  const [rate, setRate] = useState(8);
  const [running, setRunning] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [allowed, setAllowed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [sent, setSent] = useState(0);
  const [dim, setDim] = useState(0);

  const idRef = useRef(0);
  // Requests allowed in the rolling 1s bucket that gates this simulator.
  const windowRef = useRef<{ start: number; count: number }>({ start: 0, count: 0 });

  function decide(): boolean {
    const now = Date.now();
    const w = windowRef.current;
    if (now - w.start >= 1000) {
      w.start = now;
      w.count = 0;
    }
    if (w.count < LIMIT) {
      w.count += 1;
      return true;
    }
    return false;
  }

  function fire(n = 1) {
    for (let i = 0; i < n; i++) {
      const ok = decide();
      const id = idRef.current++;
      setPackets((p) => [...p, { id, ok }]);
      setSent((v) => v + 1);
      if (ok) setAllowed((v) => v + 1);
      else setBlocked((v) => v + 1);
    }
  }

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => fire(1), Math.round(1000 / rate));
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, rate]);

  function reset() {
    setRunning(false);
    setPackets([]);
    setAllowed(0);
    setBlocked(0);
    setSent(0);
    idRef.current = 0;
    windowRef.current = { start: 0, count: 0 };
  }

  const overLimit = rate > LIMIT;

  return (
    <div className="not-prose">
      <RlHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* controls */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <RlRateSlider value={rate} onChange={setRate} label={s.rate} unit={s.perSec} />
          <RlControls
            running={running}
            onToggle={() => setRunning((r) => !r)}
            onSend={() => fire(1)}
            onBurst={() => fire(8)}
            onReset={reset}
            labels={s}
          />
        </div>

        {/* keyed-by selector */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">{t.keyedBy}</span>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {t.dimensions.map((d, i) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDim(i)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
                  dim === i ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-accent">{t.dimensions[dim].sample}</span>
        </div>

        {/* stage */}
        <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
          <Node icon={Laptop} label={t.client} active={running} tone="accent" />

          {/* lane with the limiter in the middle */}
          <div className="relative h-40">
            {/* rails */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />

            {/* limiter chip in the centre */}
            <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <motion.div
                animate={overLimit && running ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className={cn(
                  'grid h-14 w-14 place-items-center rounded-2xl border-2 bg-surface shadow-sm',
                  overLimit ? 'border-rose-500/70 text-rose-500' : 'border-accent/70 text-accent',
                )}
              >
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </motion.div>
              <div className="mt-1.5 text-center">
                <div className="text-[0.7rem] font-semibold text-fg">{t.limiter}</div>
                <div className="font-mono text-[0.6rem] text-muted">
                  {t.limitLabel} {LIMIT}
                  {s.perSec}
                </div>
              </div>
            </div>

            {/* packets */}
            <AnimatePresence>
              {packets.map((p) => (
                <motion.div
                  key={p.id}
                  className={cn(
                    'absolute top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full shadow',
                    p.ok ? 'bg-emerald-500' : 'bg-rose-500',
                  )}
                  initial={{ left: '0%', y: '-50%', opacity: 0 }}
                  animate={
                    p.ok
                      ? { left: ['0%', '50%', '100%'], y: '-50%', opacity: [0, 1, 1] }
                      : { left: ['0%', '46%', '46%'], y: ['-50%', '-50%', '120%'], opacity: [0, 1, 0] }
                  }
                  transition={{ duration: TRAVEL_MS / 1000, times: [0, 0.5, 1], ease: 'linear' }}
                  onAnimationComplete={() =>
                    setPackets((list) => list.filter((x) => x.id !== p.id))
                  }
                />
              ))}
            </AnimatePresence>

            {/* 429 badge when over limit */}
            {overLimit && running && (
              <div className="absolute left-1/2 top-[68%] z-0 -translate-x-1/2 font-mono text-[0.6rem] font-bold text-rose-500">
                429
              </div>
            )}
          </div>

          <Node icon={Server} label={t.server} active={running} tone="emerald" />
        </div>

        {/* status */}
        <div className="mt-4 min-h-[1.25rem] text-center text-xs font-medium">
          {overLimit ? (
            <span className="text-rose-500">{t.overLimitNote}</span>
          ) : running ? (
            <span className="text-muted">&nbsp;</span>
          ) : (
            <span className="text-muted">{t.idleHint}</span>
          )}
        </div>

        {/* stats */}
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <RlStats allowed={allowed} blocked={blocked} labels={s} />
          <div className="grid place-items-center rounded-xl border border-border bg-surface px-4 text-center">
            <div className="font-mono text-lg font-bold tabular-nums text-fg">{sent}</div>
            <div className="text-[0.6rem] uppercase tracking-wide text-muted">{t.sent}</div>
          </div>
        </div>

        <p className="mt-3 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.dimensions[dim].note}
        </p>
      </div>
    </div>
  );
}

function Node({
  icon: Icon,
  label,
  active,
  tone,
}: {
  icon: typeof Server;
  label: string;
  active?: boolean;
  tone: 'accent' | 'emerald';
}) {
  const color = tone === 'emerald' ? 'text-emerald-500' : 'text-accent';
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className={cn(
          'grid h-14 w-14 place-items-center rounded-xl border bg-surface transition-colors',
          active ? cn('border-current shadow-md', color) : 'border-border text-muted',
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="text-xs font-semibold text-fg">{label}</div>
    </div>
  );
}
