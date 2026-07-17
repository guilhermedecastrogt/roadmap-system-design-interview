'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Globe, Heart, Timer } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { databaseContent } from './content';
import { DbHeading } from './DbKit';

type Region = 'a' | 'b';
type Mode = 'eventual' | 'strong';

type ReplDot = { id: number; from: Region };

const REPL_MS = 1100;
const HOP_MS = 700;

/**
 * Multi-region lab: one likes counter, two regions. In eventual mode a like
 * commits locally and replicates in the background (counters briefly
 * disagree); in strong mode every like coordinates across the ocean before
 * committing (counters never disagree — everyone pays the round trip).
 */
export function DbMultiRegion({ locale }: { locale: Locale }) {
  const t = databaseContent[locale].multiRegion;

  const [mode, setMode] = useState<Mode>('eventual');
  const [counts, setCounts] = useState<Record<Region, number>>({ a: 0, b: 0 });
  const [replDots, setReplDots] = useState<ReplDot[]>([]);
  const [coord, setCoord] = useState<{ from: Region; phase: 'go' | 'back' } | null>(null);
  const [lastWrite, setLastWrite] = useState<Region | null>(null);
  const idRef = useRef(0);
  const runRef = useRef(0);

  function switchMode(next: Mode) {
    runRef.current += 1;
    setMode(next);
    setCounts({ a: 0, b: 0 });
    setReplDots([]);
    setCoord(null);
    setLastWrite(null);
  }

  function like(region: Region) {
    setLastWrite(region);
    if (mode === 'eventual') {
      // Commit locally right away; replicate in the background.
      setCounts((prev) => ({ ...prev, [region]: prev[region] + 1 }));
      setReplDots((prev) => [...prev, { id: idRef.current++, from: region }]);
      return;
    }

    // Strong: coordinate across regions before committing anywhere.
    if (coord) return;
    const id = ++runRef.current;
    setCoord({ from: region, phase: 'go' });
    setTimeout(() => {
      if (runRef.current !== id) return;
      setCoord({ from: region, phase: 'back' });
      setTimeout(() => {
        if (runRef.current !== id) return;
        setCoord(null);
        setCounts((prev) => ({ a: prev.a + 1, b: prev.b + 1 }));
      }, HOP_MS);
    }, HOP_MS);
  }

  function replArrived(dot: ReplDot) {
    setReplDots((prev) => prev.filter((d) => d.id !== dot.id));
    const other: Region = dot.from === 'a' ? 'b' : 'a';
    setCounts((prev) => ({ ...prev, [other]: prev[other] + 1 }));
  }

  const diverged = counts.a !== counts.b;
  const busy = replDots.length > 0 || coord !== null;

  return (
    <div className="not-prose">
      <DbHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* mode toggle */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
          <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
            {t.modeLabel}
          </span>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(['eventual', 'strong'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => switchMode(opt)}
                className={cn(
                  'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
                  mode === opt ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {opt === 'eventual' ? t.eventual : t.strong}
              </button>
            ))}
          </div>
        </div>

        {/* stage */}
        <div className="grid grid-cols-[1fr_minmax(3.5rem,8rem)_1fr] items-stretch gap-1 sm:gap-2">
          <RegionPanel
            label={t.regionA}
            likes={counts.a}
            likesLabel={t.likesLabel}
            likeLabel={t.likeFrom}
            latency={mode === 'eventual' ? '~10 ms' : '~180 ms'}
            latencyLabel={t.writeLatency}
            flash={lastWrite === 'a'}
            disabled={mode === 'strong' && coord !== null}
            onLike={() => like('a')}
          />

          {/* ocean lane */}
          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full border-t-2 border-dashed border-border bg-transparent" />
            <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 text-muted/60">
              <Globe className="h-5 w-5" aria-hidden />
            </div>

            {/* eventual replication dots */}
            <AnimatePresence>
              {replDots.map((dot) => (
                <motion.div
                  key={dot.id}
                  className="absolute top-1/2 z-10 h-3 w-3 rounded-full bg-emerald-500 shadow shadow-emerald-500/40"
                  initial={{ left: dot.from === 'a' ? '0%' : '94%', y: '-50%', opacity: 0 }}
                  animate={{ left: dot.from === 'a' ? '94%' : '0%', y: '-50%', opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: REPL_MS / 1000, ease: 'easeInOut' }}
                  onAnimationComplete={() => replArrived(dot)}
                />
              ))}
            </AnimatePresence>

            {/* strong coordination dot */}
            <AnimatePresence>
              {coord && (
                <motion.div
                  key={`${coord.from}-${coord.phase}`}
                  className="absolute top-1/2 z-10 h-3 w-3 rounded-full bg-amber-500 shadow shadow-amber-500/40"
                  initial={{
                    left:
                      (coord.phase === 'go') === (coord.from === 'a') ? '0%' : '94%',
                    y: '-50%',
                    opacity: 0,
                  }}
                  animate={{
                    left:
                      (coord.phase === 'go') === (coord.from === 'a') ? '94%' : '0%',
                    y: '-50%',
                    opacity: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: HOP_MS / 1000, ease: 'easeInOut' }}
                />
              )}
            </AnimatePresence>

            {/* lane status */}
            <div className="absolute inset-x-0 top-[68%] text-center font-mono text-[0.6rem] text-muted">
              {replDots.length > 0 && <span className="text-emerald-500">{t.syncing}</span>}
              {coord && <span className="text-amber-500">{t.coordinating}</span>}
            </div>
          </div>

          <RegionPanel
            label={t.regionB}
            likes={counts.b}
            likesLabel={t.likesLabel}
            likeLabel={t.likeFrom}
            latency={mode === 'eventual' ? '~10 ms' : '~180 ms'}
            latencyLabel={t.writeLatency}
            flash={lastWrite === 'b'}
            disabled={mode === 'strong' && coord !== null}
            onLike={() => like('b')}
          />
        </div>

        {/* convergence status */}
        <div className="mt-3 min-h-[1.25rem] text-center text-xs font-medium">
          {diverged ? (
            <span className="text-amber-500">{t.divergedNote}</span>
          ) : busy ? (
            <span className="text-muted">&nbsp;</span>
          ) : counts.a > 0 ? (
            <span className="text-emerald-500">{t.convergedNote}</span>
          ) : (
            <span className="text-muted">&nbsp;</span>
          )}
        </div>

        {/* mode explanation */}
        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-2 rounded-lg border p-3 text-xs leading-relaxed text-fg/85',
              mode === 'eventual'
                ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
                : 'border-amber-500/30 bg-amber-500/[0.06]',
            )}
          >
            {mode === 'eventual' ? t.eventualNote : t.strongNote}
          </motion.p>
        </AnimatePresence>

        <p className="mt-3 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}

function RegionPanel({
  label,
  likes,
  likesLabel,
  likeLabel,
  latency,
  latencyLabel,
  flash,
  disabled,
  onLike,
}: {
  label: string;
  likes: number;
  likesLabel: string;
  likeLabel: string;
  latency: string;
  latencyLabel: string;
  flash: boolean;
  disabled: boolean;
  onLike: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="text-xs font-bold text-fg">{label}</div>

      <button
        type="button"
        onClick={onLike}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:shadow-rose-500/30 disabled:opacity-50"
      >
        <Heart className="h-4 w-4 fill-current" aria-hidden />
        {likeLabel}
      </button>

      <div className="flex flex-col items-center gap-1">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface-2 text-muted">
          <Database className="h-5 w-5" aria-hidden />
        </div>
        <motion.div
          key={likes}
          initial={flash ? { scale: 1.3 } : false}
          animate={{ scale: 1 }}
          className="font-mono text-xl font-bold tabular-nums text-fg"
        >
          {likes}
        </motion.div>
        <div className="text-[0.6rem] uppercase tracking-wide text-muted">{likesLabel}</div>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
        <Timer className="h-3 w-3 text-muted" aria-hidden />
        <span className="font-mono text-[0.65rem] font-semibold text-fg">{latency}</span>
        <span className="text-[0.6rem] text-muted">{latencyLabel}</span>
      </div>
    </div>
  );
}
