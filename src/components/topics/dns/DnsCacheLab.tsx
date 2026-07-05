'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Gauge,
  MonitorSmartphone,
  Network,
  ServerCog,
  Timer,
  Zap,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dnsContent, type CacheSource } from './content';

const TTL_BROWSER = 10;
const TTL_RESOLVER = 30;
const CHECK_MS = 500;
const FULL_MS = 1400;
const MAX_BAR_MS = 150;

type LayerId = CacheSource; // browser | resolver | full
type LayerStatus = 'idle' | 'checking' | 'hit' | 'miss';
type LogEntry = { id: number; source: CacheSource; ms: number };

const SOURCE_STYLE: Record<CacheSource, { text: string; bg: string; bar: string }> = {
  browser: { text: 'text-emerald-500', bg: 'bg-emerald-500', bar: 'bg-emerald-500' },
  resolver: { text: 'text-accent', bg: 'bg-accent', bar: 'bg-accent' },
  full: { text: 'text-amber-500', bg: 'bg-amber-500', bar: 'bg-amber-500' },
};

/**
 * Layered cache lab: a lookup probes the browser cache, then the resolver
 * cache, then falls through to the full hierarchy. Each cached layer has its
 * own TTL counting down — resolve repeatedly and watch answers get cheaper,
 * then expire.
 */
export function DnsCacheLab({ locale }: { locale: Locale }) {
  const c = dnsContent[locale].cache;

  const [ttlB, setTtlB] = useState(0);
  const [ttlR, setTtlR] = useState(0);
  const [busy, setBusy] = useState(false);
  const [probe, setProbe] = useState<LayerId | null>(null);
  const [status, setStatus] = useState<Record<LayerId, LayerStatus>>({
    browser: 'idle',
    resolver: 'idle',
    full: 'idle',
  });
  const [last, setLast] = useState<LogEntry | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [fullRun, setFullRun] = useState(0); // keys the hierarchy ping animation

  const idRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ttlBRef = useRef(0);
  const ttlRRef = useRef(0);
  ttlBRef.current = ttlB;
  ttlRRef.current = ttlR;

  useEffect(() => {
    const t = setInterval(() => {
      setTtlB((v) => Math.max(0, v - 1));
      setTtlR((v) => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const after = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };

  function finish(source: CacheSource, ms: number) {
    const entry: LogEntry = { id: idRef.current++, source, ms };
    setStatus((s) => ({ ...s, [source]: 'hit' }));
    setProbe(null);
    setLast(entry);
    setLog((l) => [entry, ...l].slice(0, 6));
    if (source === 'resolver') setTtlB(TTL_BROWSER);
    if (source === 'full') {
      setTtlR(TTL_RESOLVER);
      setTtlB(TTL_BROWSER);
    }
    setBusy(false);
  }

  function resolve() {
    if (busy) return;
    setBusy(true);
    setLast(null);
    setStatus({ browser: 'checking', resolver: 'idle', full: 'idle' });
    setProbe('browser');

    after(CHECK_MS, () => {
      if (ttlBRef.current > 0) {
        finish('browser', 1 + Math.floor(Math.random() * 2));
        return;
      }
      setStatus((s) => ({ ...s, browser: 'miss', resolver: 'checking' }));
      setProbe('resolver');

      after(CHECK_MS, () => {
        if (ttlRRef.current > 0) {
          finish('resolver', 10 + Math.floor(Math.random() * 8));
          return;
        }
        setStatus((s) => ({ ...s, resolver: 'miss', full: 'checking' }));
        setProbe('full');
        setFullRun((n) => n + 1);

        after(FULL_MS, () => {
          finish('full', 90 + Math.floor(Math.random() * 60));
        });
      });
    });
  }

  const layers: {
    id: LayerId;
    icon: typeof MonitorSmartphone;
    ttl?: number;
    ttlMax?: number;
  }[] = [
    { id: 'browser', icon: MonitorSmartphone, ttl: ttlB, ttlMax: TTL_BROWSER },
    { id: 'resolver', icon: ServerCog, ttl: ttlR, ttlMax: TTL_RESOLVER },
    { id: 'full', icon: Network },
  ];

  const barPct = last ? Math.min(100, (last.ms / MAX_BAR_MS) * 100) : 0;

  return (
    <section className="not-prose">
      <header className="mb-5">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{c.kicker}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
          {c.title}
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{c.subtitle}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
        {/* Layer stack */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="space-y-2">
            {layers.map((layer, i) => {
              const st = status[layer.id];
              const cached = layer.ttl !== undefined && layer.ttl > 0;
              const isProbe = probe === layer.id;
              const Icon = layer.icon;
              return (
                <div key={layer.id}>
                  {i > 0 && (
                    <div className="flex justify-center py-0.5 text-muted/60" aria-hidden>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'relative flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-300',
                      st === 'hit'
                        ? 'border-emerald-500/60 bg-emerald-500/[0.07]'
                        : st === 'miss'
                          ? 'border-amber-500/50 bg-amber-500/[0.05]'
                          : isProbe
                            ? 'border-accent/60 bg-accent/[0.06]'
                            : 'border-border bg-bg',
                    )}
                  >
                    {isProbe && (
                      <motion.span
                        layoutId="dns-cache-probe"
                        aria-hidden
                        className="absolute -left-1 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]"
                      />
                    )}
                    <span
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors',
                        st === 'hit'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : st === 'miss'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-surface-2 text-muted',
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-fg">
                          {c.layers[layer.id].label}
                        </span>
                        <AnimatePresence mode="wait">
                          {st === 'checking' ? (
                            <motion.span
                              key="checking"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="font-mono text-[0.65rem] uppercase tracking-wide text-accent"
                            >
                              {c.checking}
                            </motion.span>
                          ) : st === 'hit' ? (
                            <motion.span
                              key="hit"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-full bg-emerald-500/15 px-2 py-px font-mono text-[0.65rem] font-bold uppercase tracking-wide text-emerald-500"
                            >
                              {c.hit}
                            </motion.span>
                          ) : st === 'miss' ? (
                            <motion.span
                              key="miss"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-full bg-amber-500/15 px-2 py-px font-mono text-[0.65rem] font-bold uppercase tracking-wide text-amber-500"
                            >
                              {c.miss}
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </div>
                      <p className="font-mono text-[0.68rem] text-muted">
                        {c.layers[layer.id].sublabel}
                      </p>

                      {/* TTL bar for cache layers */}
                      {layer.ttl !== undefined && layer.ttlMax !== undefined && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-muted">
                            <Timer className="h-3 w-3" aria-hidden />
                            {c.ttl}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                            <motion.div
                              className={cn(
                                'h-full rounded-full',
                                cached ? 'bg-accent' : 'bg-transparent',
                              )}
                              animate={{ width: `${(layer.ttl / layer.ttlMax) * 100}%` }}
                              transition={{ duration: 1, ease: 'linear' }}
                            />
                          </div>
                          <span
                            className={cn(
                              'w-8 text-right font-mono text-[0.68rem] font-semibold tabular-nums',
                              cached ? 'text-fg' : 'text-muted',
                            )}
                          >
                            {cached ? `${layer.ttl}s` : c.emptyLayer}
                          </span>
                        </div>
                      )}

                      {/* Hierarchy pings during a full lookup */}
                      {layer.id === 'full' && (
                        <div className="mt-2 flex gap-1.5" key={fullRun}>
                          {(['root', 'TLD', 'auth'] as const).map((label, j) => (
                            <motion.span
                              key={label}
                              initial={false}
                              animate={
                                status.full === 'checking'
                                  ? { opacity: [0.4, 1, 0.4], scale: [1, 1.08, 1] }
                                  : { opacity: 0.6, scale: 1 }
                              }
                              transition={
                                status.full === 'checking'
                                  ? { duration: 0.9, delay: j * 0.35, repeat: Infinity }
                                  : { duration: 0.2 }
                              }
                              className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[0.62rem] text-muted"
                            >
                              {label}
                            </motion.span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">{c.ttlNote}</p>
        </div>

        {/* Controls, meter, log */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <button
            type="button"
            onClick={resolve}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-70"
          >
            <Zap className="h-4 w-4 fill-current" aria-hidden />
            {busy ? c.resolving : c.resolveBtn}
          </button>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-muted">
                <Gauge className="h-3.5 w-3.5" aria-hidden />
                {c.latency}
              </span>
              <AnimatePresence mode="wait">
                {busy ? (
                  <motion.span
                    key="busy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-muted"
                  >
                    …
                  </motion.span>
                ) : last ? (
                  <motion.span
                    key={last.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'font-mono font-semibold tabular-nums',
                      SOURCE_STYLE[last.source].text,
                    )}
                  >
                    {last.ms} {c.unit}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  last ? SOURCE_STYLE[last.source].bar : 'bg-accent',
                )}
                animate={{ width: busy ? ['0%', '90%'] : `${barPct}%` }}
                transition={{ duration: busy ? 2 : 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-2 min-h-[1.25rem]">
              <AnimatePresence mode="wait">
                {last && (
                  <motion.p
                    key={last.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium',
                      SOURCE_STYLE[last.source].text,
                    )}
                  >
                    <span
                      className={cn('h-1.5 w-1.5 rounded-full', SOURCE_STYLE[last.source].bg)}
                    />
                    {c.sources[last.source]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-wide text-muted">
              {c.logTitle}
            </p>
            {log.length === 0 ? (
              <p className="text-xs text-muted">{c.logEmpty}</p>
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
                          SOURCE_STYLE[e.source].text,
                        )}
                      >
                        <span
                          className={cn('h-1.5 w-1.5 rounded-full', SOURCE_STYLE[e.source].bg)}
                        />
                        {c.sources[e.source]}
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

          <p className="mt-4 text-xs leading-relaxed text-muted">{c.whoCaches}</p>
        </div>
      </div>
    </section>
  );
}
