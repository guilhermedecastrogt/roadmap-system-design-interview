'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dnsContent, type SegmentId } from './content';
import { useBoxSize } from './useBoxSize';

type TreeNode = {
  id: string;
  label: string;
  depth: number;
  seg?: SegmentId;
  x: number;
  y: number;
};

const NODES: TreeNode[] = [
  { id: 'root', label: '.', depth: 0, seg: 'root', x: 0.07, y: 0.5 },
  { id: 'com', label: '.com', depth: 1, seg: 'tld', x: 0.34, y: 0.18 },
  { id: 'org', label: '.org', depth: 1, x: 0.32, y: 0.52 },
  { id: 'io', label: '.io', depth: 1, x: 0.3, y: 0.84 },
  { id: 'youtube', label: 'youtube', depth: 2, seg: 'domain', x: 0.62, y: 0.12 },
  { id: 'google', label: 'google', depth: 2, x: 0.6, y: 0.44 },
  { id: 'www', label: 'www', depth: 3, seg: 'sub', x: 0.88, y: 0.08 },
  { id: 'music', label: 'music', depth: 3, x: 0.88, y: 0.34 },
];

const EDGES: { from: string; to: string; onPath: boolean }[] = [
  { from: 'root', to: 'com', onPath: true },
  { from: 'root', to: 'org', onPath: false },
  { from: 'root', to: 'io', onPath: false },
  { from: 'com', to: 'youtube', onPath: true },
  { from: 'com', to: 'google', onPath: false },
  { from: 'youtube', to: 'www', onPath: true },
  { from: 'youtube', to: 'music', onPath: false },
];

const DEPTH_OF: Record<SegmentId, number> = { root: 0, tld: 1, domain: 2, sub: 3 };

/** One hue per hierarchy level, shared by the name chips and the map nodes. */
const LEVEL: Record<
  SegmentId,
  { stroke: string; chip: string; node: string; text: string; dot: string }
> = {
  root: {
    stroke: 'rgb(20 184 166)',
    chip: 'border-teal-500/60 bg-teal-500/10 text-teal-600 dark:text-teal-400',
    node: 'border-teal-500/70 text-teal-600 dark:text-teal-400',
    text: 'text-teal-600 dark:text-teal-400',
    dot: 'bg-teal-500',
  },
  tld: {
    stroke: 'rgb(245 158 11)',
    chip: 'border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    node: 'border-amber-500/70 text-amber-600 dark:text-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  domain: {
    stroke: 'rgb(139 92 246)',
    chip: 'border-violet-500/60 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    node: 'border-violet-500/70 text-violet-600 dark:text-violet-400',
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  sub: {
    stroke: 'rgb(14 165 233)',
    chip: 'border-sky-500/60 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    node: 'border-sky-500/70 text-sky-600 dark:text-sky-400',
    text: 'text-sky-600 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
};

const SEG_BY_DEPTH: SegmentId[] = ['root', 'tld', 'domain', 'sub'];

/**
 * Mind map of the DNS namespace: click a piece of "www.youtube.com." and the
 * matching path lights up on the tree — showing that a name is really a walk
 * from the root down to a host.
 */
export function DnsAnatomy({ locale }: { locale: Locale }) {
  const c = dnsContent[locale].anatomy;
  const [seg, setSeg] = useState<SegmentId>('tld');
  const { ref, size } = useBoxSize<HTMLDivElement>();

  const selectedDepth = DEPTH_OF[seg];
  const pos = (n: TreeNode) => ({ x: n.x * size.w, y: n.y * size.h });

  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = (b.x - a.x) * 0.5;
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  };

  // Name chips, in reading order: www . youtube . com .
  const chips: { seg: SegmentId; trailing?: boolean }[] = [
    { seg: 'sub' },
    { seg: 'domain' },
    { seg: 'tld' },
    { seg: 'root', trailing: true },
  ];

  return (
    <section className="not-prose">
      <header className="mb-5">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{c.kicker}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
          {c.title}
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{c.subtitle}</p>
      </header>

      {/* Clickable hostname */}
      <div className="mb-4 flex flex-wrap items-end justify-center gap-y-3 rounded-2xl border border-border bg-surface p-5">
        {chips.map(({ seg: id, trailing }, i) => {
          const s = c.segments[id];
          const on = seg === id;
          return (
            <span key={id} className="flex items-end">
              <button
                type="button"
                onClick={() => setSeg(id)}
                className="group flex flex-col items-center gap-1.5 px-0.5"
              >
                <span
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 font-mono text-lg font-semibold transition-all duration-300 sm:text-xl',
                    on
                      ? cn(LEVEL[id].chip, 'scale-105 shadow-sm')
                      : 'border-transparent text-fg group-hover:border-border',
                    trailing && 'min-w-[2.25rem] text-center',
                  )}
                >
                  {s.text}
                </span>
                <span
                  className={cn(
                    'font-mono text-[0.6rem] uppercase tracking-widest transition-colors',
                    on ? LEVEL[id].text : 'text-muted',
                  )}
                >
                  {s.tag}
                </span>
              </button>
              {!trailing && i < chips.length - 1 && !chips[i + 1].trailing && (
                <span className="pb-7 font-mono text-lg text-muted" aria-hidden>
                  .
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Mind map */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface/40">
        <div ref={ref} className="relative h-[300px] min-w-[560px]">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
          >
            {size.w > 0 &&
              EDGES.map((e) => {
                const a = pos(NODES.find((n) => n.id === e.from)!);
                const b = NODES.find((n) => n.id === e.to)!;
                const bp = pos(b);
                const lit = e.onPath && b.depth <= selectedDepth;
                const hue = LEVEL[SEG_BY_DEPTH[b.depth]];
                return (
                  <g key={`${e.from}-${e.to}`}>
                    <path
                      d={curve(a, bp)}
                      fill="none"
                      stroke="rgb(var(--border))"
                      strokeWidth={1.5}
                    />
                    {lit && (
                      <>
                        <path
                          d={curve(a, bp)}
                          fill="none"
                          stroke={hue.stroke}
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 5px ${hue.stroke})` }}
                        />
                        <path
                          d={curve(a, bp)}
                          fill="none"
                          stroke="white"
                          strokeOpacity={0.65}
                          strokeWidth={1.5}
                          className="flow-dash"
                        />
                      </>
                    )}
                  </g>
                );
              })}
          </svg>

          {NODES.map((n) => {
            const onPath = !!n.seg && n.depth <= selectedDepth;
            const isExact = n.seg === seg;
            const hue = LEVEL[SEG_BY_DEPTH[n.depth]];
            return (
              <motion.button
                key={n.id}
                type="button"
                disabled={!n.seg}
                onClick={() => n.seg && setSeg(n.seg)}
                animate={{ scale: isExact ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
                className={cn(
                  'absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-surface px-3.5 py-1.5 font-mono text-xs font-semibold transition-all duration-300',
                  onPath
                    ? cn(hue.node, 'shadow-sm')
                    : 'border-border text-muted opacity-60',
                  n.seg && 'hover:opacity-100',
                  isExact && 'ring-2 ring-offset-2 ring-offset-bg',
                  isExact && `ring-current ${hue.text}`,
                )}
              >
                {n.label}
                {isExact && (
                  <motion.span
                    aria-hidden
                    className={cn('absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full', hue.dot)}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  />
                )}
              </motion.button>
            );
          })}

          <p className="absolute bottom-3 left-0 right-0 text-center text-[0.7rem] text-muted">
            {c.treeCaption}
          </p>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted">{c.mapHint}</p>

      {/* Explanation card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={seg}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5"
        >
          <span
            className={cn(
              'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-bg font-mono text-sm font-bold',
              LEVEL[seg].node,
            )}
          >
            {c.segments[seg].text === '.' ? '.' : c.segments[seg].text[0].toUpperCase()}
          </span>
          <div>
            <p className={cn('font-mono text-[0.7rem] uppercase tracking-widest', LEVEL[seg].text)}>
              {c.segments[seg].tag}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-fg/85">{c.segments[seg].desc}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
