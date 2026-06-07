'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Gauge, Timer, Zap } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dnsContent } from './content';

const TTL_TOTAL = 20; // seconds
const RESOLVE_MS = 1400;
const MAX_BAR_MS = 150;

type Status = 'idle' | 'resolving' | 'miss' | 'hit';
type LogEntry = { id: number; type: 'miss' | 'hit'; ms: number };

export function CacheTtlSim({ locale }: { locale: Locale }) {
  const c = dnsContent[locale].cache;
  const ip = dnsContent[locale].translator.to;

  const [status, setStatus] = useState<Status>('idle');
  const [ttl, setTtl] = useState(0); // seconds remaining
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logId = useRef(0);
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cached = ttl > 0;

  // TTL countdown.
  useEffect(() => {
    if (ttl <= 0) return;
    const t = setInterval(() => setTtl((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [ttl]);

  useEffect(() => {
    return () => {
      if (resolveTimer.current) clearTimeout(resolveTimer.current);
    };
  }, []);

  function resolve() {
    if (status === 'resolving') return;

    if (cached) {
      // Cache hit — instant. TTL is NOT refreshed on read.
      const ms = 1 + Math.floor(Math.random() * 3);
      setStatus('hit');
      setLastMs(ms);
      setLog((l) =>
        [{ id: logId.current++, type: 'hit' as const, ms }, ...l].slice(0, 5),
      );
      return;
    }

    // Cache miss — full resolution.
    setStatus('resolving');
    setLastMs(null);
    resolveTimer.current = setTimeout(() => {
      const ms = 90 + Math.floor(Math.random() * 60);
      setStatus('miss');
      setLastMs(ms);
      setTtl(TTL_TOTAL);
      setLog((l) =>
        [{ id: logId.current++, type: 'miss' as const, ms }, ...l].slice(0, 5),
      );
    }, RESOLVE_MS);
  }

  const barPct = lastMs ? Math.min(100, (lastMs / MAX_BAR_MS) * 100) : 0;

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* Cache box */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
            <Database className="h-4 w-4 text-accent" aria-hidden />
            {c.cachedRecord}
          </div>

          <AnimatePresence mode="wait">
            {cached ? (
              <motion.div
                key="record"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-xl border border-accent/30 bg-accent/[0.06] p-4"
              >
                <div className="flex items-center justify-between font-mono text-sm">
                  <span className="text-fg">youtube.com</span>
                  <span className="text-accent">{ip}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Timer className="h-3.5 w-3.5" aria-hidden />
                    {c.ttl}
                  </span>
                  <span className="font-mono font-semibold text-fg tabular-nums">
                    {ttl}s
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    animate={{ width: `${(ttl / TTL_TOTAL) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-[6.5rem] items-center justify-center rounded-xl border border-dashed border-border text-center text-xs text-muted"
              >
                {status === 'resolving' ? c.resolving : c.ttlExpired}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-3 text-xs leading-relaxed text-muted">{c.ttlNote}</p>
        </div>

        {/* Controls + result + log */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <button
            type="button"
            onClick={resolve}
            disabled={status === 'resolving'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-70"
          >
            <Zap className="h-4 w-4 fill-current" aria-hidden />
            {status === 'resolving' ? c.resolving : c.resolveBtn}
          </button>

          {/* Resolving / result meter */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-muted">
                <Gauge className="h-3.5 w-3.5" aria-hidden />
                latency
              </span>
              <AnimatePresence mode="wait">
                {status === 'resolving' ? (
                  <motion.span
                    key="r"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-muted"
                  >
                    …
                  </motion.span>
                ) : lastMs != null ? (
                  <motion.span
                    key={lastMs}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'font-mono font-semibold tabular-nums',
                      status === 'hit' ? 'text-emerald-500' : 'text-amber-500',
                    )}
                  >
                    {lastMs} {c.unit}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  status === 'hit' ? 'bg-emerald-500' : 'bg-amber-500',
                )}
                animate={{
                  width:
                    status === 'resolving'
                      ? ['0%', '92%']
                      : `${barPct}%`,
                }}
                transition={{
                  duration: status === 'resolving' ? RESOLVE_MS / 1000 : 0.5,
                  ease: status === 'resolving' ? 'easeOut' : 'easeOut',
                }}
              />
            </div>
            {status === 'hit' && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {c.hit} · {c.hitText}
              </p>
            )}
            {status === 'miss' && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {c.miss} · {c.missText}
              </p>
            )}
          </div>

          {/* Log */}
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-wide text-muted">
              {c.logTitle}
            </p>
            {log.length === 0 ? (
              <p className="text-xs text-muted">{c.empty}</p>
            ) : (
              <ul className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {log.map((e) => (
                    <motion.li
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 font-medium',
                          e.type === 'hit' ? 'text-emerald-500' : 'text-amber-500',
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            e.type === 'hit' ? 'bg-emerald-500' : 'bg-amber-500',
                          )}
                        />
                        {e.type === 'hit' ? c.hit : c.miss}
                      </span>
                      <span className="font-mono tabular-nums text-muted">
                        {e.ms} {c.unit}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-muted">{c.whoCaches}</p>
        </div>
      </div>
    </div>
  );
}
