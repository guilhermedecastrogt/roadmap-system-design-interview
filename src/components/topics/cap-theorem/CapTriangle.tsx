'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, Minus } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { capContent, type CapLetter, type CapPair } from './content';
import { CapHeading, CAP_ICONS, CAP_TEXT, CAP_BG, CAP_BORDER } from './CapKit';

type Selection = { kind: 'letter'; id: CapLetter } | { kind: 'pair'; id: CapPair };

/** Which two letters each pair connects, and where its edge pill sits. */
const PAIR_EDGES: Record<CapPair, { letters: [CapLetter, CapLetter]; pos: string }> = {
  ca: { letters: ['c', 'a'], pos: 'left-[13%] top-[46%]' },
  cp: { letters: ['c', 'p'], pos: 'right-[13%] top-[46%]' },
  ap: { letters: ['a', 'p'], pos: 'left-1/2 top-[88%] -translate-x-1/2' },
};

/** Vertex positions inside the stage (percentages of the container). */
const VERTEX_POS: Record<CapLetter, string> = {
  c: 'left-1/2 top-[6%] -translate-x-1/2',
  a: 'left-[10%] top-[74%]',
  p: 'right-[10%] top-[74%]',
};

/**
 * Interactive CAP triangle: tap a corner (C / A / P) for its real definition,
 * or an edge (AP / CP / CA) to see what leaning on that pair gives and costs.
 */
export function CapTriangle({ locale }: { locale: Locale }) {
  const t = capContent[locale].triangle;
  const [sel, setSel] = useState<Selection>({ kind: 'pair', id: 'ap' });

  const activeLetters: CapLetter[] =
    sel.kind === 'letter' ? [sel.id] : [...PAIR_EDGES[sel.id].letters];

  return (
    <div className="not-prose">
      <CapHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        <p className="mb-2 text-center font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          {t.tapHint}
        </p>

        {/* stage */}
        <div className="relative mx-auto aspect-[10/8] max-w-md sm:aspect-[10/7]">
          {/* edges */}
          <svg
            viewBox="0 0 100 80"
            className="absolute inset-0 h-full w-full"
            aria-hidden
            preserveAspectRatio="none"
          >
            <EdgeLine pair="ca" x1={50} y1={12} x2={14} y2={62} sel={sel} />
            <EdgeLine pair="cp" x1={50} y1={12} x2={86} y2={62} sel={sel} />
            <EdgeLine pair="ap" x1={14} y1={62} x2={86} y2={62} sel={sel} />
          </svg>

          {/* vertices */}
          {(['c', 'a', 'p'] as const).map((letter) => {
            const Icon = CAP_ICONS[letter];
            const active = activeLetters.includes(letter);
            return (
              <button
                key={letter}
                type="button"
                onClick={() => setSel({ kind: 'letter', id: letter })}
                className={cn('absolute z-10 flex flex-col items-center gap-1', VERTEX_POS[letter])}
              >
                <motion.span
                  animate={{ scale: active ? 1.08 : 1, opacity: active ? 1 : 0.55 }}
                  className={cn(
                    'grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md sm:h-14 sm:w-14',
                    CAP_BG[letter],
                    active && 'ring-2 ring-offset-2 ring-offset-surface',
                    letter === 'c' && active && 'ring-sky-500/50',
                    letter === 'a' && active && 'ring-emerald-500/50',
                    letter === 'p' && active && 'ring-violet-500/50',
                  )}
                >
                  <span className="font-display text-xl font-bold uppercase">{letter}</span>
                </motion.span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[0.65rem] font-semibold sm:text-xs',
                    active ? CAP_TEXT[letter] : 'text-muted',
                  )}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  {t.letters[letter].name}
                </span>
              </button>
            );
          })}

          {/* edge pills */}
          {(Object.keys(PAIR_EDGES) as CapPair[]).map((pair) => {
            const active = sel.kind === 'pair' && sel.id === pair;
            return (
              <button
                key={pair}
                type="button"
                onClick={() => setSel({ kind: 'pair', id: pair })}
                className={cn(
                  'absolute z-10 rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase transition-colors',
                  PAIR_EDGES[pair].pos,
                  active
                    ? 'border-accent bg-accent text-accent-fg shadow-md'
                    : 'border-border bg-surface text-muted hover:border-accent/40 hover:text-fg',
                )}
              >
                {t.pairs[pair].label}
              </button>
            );
          })}
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-muted">
          {t.pickTwo}
        </p>

        {/* detail panel */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {sel.kind === 'letter' ? (
              <LetterCard key={`letter-${sel.id}`} letter={sel.id} t={t} />
            ) : (
              <PairCard key={`pair-${sel.id}`} pair={sel.id} t={t} />
            )}
          </AnimatePresence>
        </div>

        <p className="mt-4 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}

function EdgeLine({
  pair,
  x1,
  y1,
  x2,
  y2,
  sel,
}: {
  pair: CapPair;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  sel: Selection;
}) {
  const active = sel.kind === 'pair' && sel.id === pair;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={cn(
        'transition-all',
        active ? 'stroke-accent' : 'stroke-border',
      )}
      strokeWidth={active ? 1.6 : 0.8}
      strokeDasharray={active ? undefined : '2.5 2'}
      vectorEffect="non-scaling-stroke"
      strokeLinecap="round"
    />
  );
}

function LetterCard({
  letter,
  t,
}: {
  letter: CapLetter;
  t: (typeof capContent)['en']['triangle'];
}) {
  const meta = t.letters[letter];
  const Icon = CAP_ICONS[letter];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={cn('rounded-xl border bg-surface p-4', CAP_BORDER[letter])}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', CAP_TEXT[letter])} aria-hidden />
        <span className={cn('text-sm font-bold', CAP_TEXT[letter])}>{meta.name}</span>
        <span className="text-xs text-muted">— {meta.tagline}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-fg/85">{meta.definition}</p>
      <p className="mt-2 rounded-lg bg-surface-2 p-2.5 text-xs leading-relaxed text-muted">
        {meta.example}
      </p>
    </motion.div>
  );
}

function PairCard({
  pair,
  t,
}: {
  pair: CapPair;
  t: (typeof capContent)['en']['triangle'];
}) {
  const meta = t.pairs[pair];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-accent/30 bg-surface p-4"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-fg">
          {meta.label}
        </span>
        <span className="text-sm font-bold text-fg">{meta.name}</span>
        <span className="text-xs text-muted">— {meta.tagline}</span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-wide text-emerald-500">
            {t.givesLabel}
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {meta.gives.map((item) => (
              <li key={item} className="flex gap-1.5 text-xs leading-relaxed text-fg/85">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-wide text-amber-500">
            {t.costsLabel}
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {meta.costs.map((item) => (
              <li key={item} className="flex gap-1.5 text-xs leading-relaxed text-fg/85">
                <Minus className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        <span className="font-mono text-[0.65rem] uppercase tracking-wide">{t.systemsLabel}: </span>
        {meta.systems}
      </p>

      {pair === 'ca' && (
        <p className="mt-3 flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-2.5 text-xs leading-relaxed text-fg/85">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
          {t.caWarning}
        </p>
      )}
    </motion.div>
  );
}
