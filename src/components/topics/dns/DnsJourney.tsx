'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CornerDownLeft,
  Database,
  GitBranch,
  Globe,
  Network,
  Play,
  RotateCcw,
  ServerCog,
  X,
  type LucideIcon,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dnsContent, type DnsNodeId } from './content';
import { useBoxSize } from './useBoxSize';

type Pt = { x: number; y: number };
type EdgeKind = 'request' | 'referral' | 'response';
type PacketId = 'query' | 'referral' | 'ip';

type StepStruct = {
  edge?: { from: DnsNodeId; to: DnsNodeId; kind: EdgeKind };
  packet?: PacketId;
  focus?: DnsNodeId;
  visits?: DnsNodeId[];
};

const POS: Record<DnsNodeId, Pt> = {
  browser: { x: 0.09, y: 0.5 },
  resolver: { x: 0.42, y: 0.5 },
  root: { x: 0.85, y: 0.13 },
  tld: { x: 0.85, y: 0.5 },
  auth: { x: 0.85, y: 0.87 },
};

const ICON: Record<DnsNodeId, LucideIcon> = {
  browser: Globe,
  resolver: ServerCog,
  root: Network,
  tld: Building2,
  auth: Database,
};

const KIND_COLOR: Record<EdgeKind, string> = {
  request: 'rgb(var(--accent))',
  referral: 'rgb(245 158 11)',
  response: 'rgb(16 185 129)',
};

const TOPOLOGY: [DnsNodeId, DnsNodeId][] = [
  ['browser', 'resolver'],
  ['resolver', 'root'],
  ['resolver', 'tld'],
  ['resolver', 'auth'],
];

const ITERATIVE: StepStruct[] = [
  { edge: { from: 'browser', to: 'resolver', kind: 'request' }, packet: 'query' },
  { edge: { from: 'resolver', to: 'root', kind: 'request' }, packet: 'query' },
  { edge: { from: 'root', to: 'resolver', kind: 'referral' }, packet: 'referral' },
  { edge: { from: 'resolver', to: 'tld', kind: 'request' }, packet: 'query' },
  { edge: { from: 'tld', to: 'resolver', kind: 'referral' }, packet: 'referral' },
  { edge: { from: 'resolver', to: 'auth', kind: 'request' }, packet: 'query' },
  { edge: { from: 'auth', to: 'resolver', kind: 'response' }, packet: 'ip' },
  { edge: { from: 'resolver', to: 'browser', kind: 'response' }, packet: 'ip' },
];

const RECURSIVE: StepStruct[] = [
  { edge: { from: 'browser', to: 'resolver', kind: 'request' }, packet: 'query' },
  { focus: 'resolver', visits: ['root', 'tld', 'auth'] },
  { edge: { from: 'resolver', to: 'browser', kind: 'response' }, packet: 'ip' },
];

const STEP_MS = 1650;
const CURVE_K = 0.16;
const SAMPLES = 24;

/**
 * Requests and responses travel different lanes: the control point sits to
 * the right of the direction of travel, so reversing an edge mirrors the arc.
 */
function controlPoint(a: Pt, b: Pt): Pt {
  return {
    x: (a.x + b.x) / 2 - (b.y - a.y) * CURVE_K,
    y: (a.y + b.y) / 2 + (b.x - a.x) * CURVE_K,
  };
}

function quadAt(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

/**
 * The DNS lookup, staged: an animated map where a packet rides curved lanes
 * between browser, resolver and the name-server hierarchy. Two modes
 * (iterative / recursive), a step timeline, clickable nodes, and a compare
 * panel at the end.
 */
export function DnsJourney({ locale }: { locale: Locale }) {
  const c = dnsContent[locale].journey;
  const { ref, size } = useBoxSize<HTMLDivElement>();

  const [mode, setMode] = useState<'iterative' | 'recursive'>('iterative');
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<DnsNodeId | null>(null);

  const struct = mode === 'iterative' ? ITERATIVE : RECURSIVE;
  const texts = c[mode];
  const current = struct[stepIndex];
  const atEnd = stepIndex >= struct.length - 1;

  const visited = useMemo(() => {
    const set = new Set<DnsNodeId>();
    for (let i = 0; i <= stepIndex && i < struct.length; i++) {
      const s = struct[i];
      if (s.edge) {
        set.add(s.edge.from);
        set.add(s.edge.to);
      }
      if (s.focus) set.add(s.focus);
      s.visits?.forEach((v) => set.add(v));
    }
    return set;
  }, [struct, stepIndex]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= struct.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, stepIndex, struct.length]);

  function switchMode(next: 'iterative' | 'recursive') {
    if (next === mode) return;
    setMode(next);
    setStepIndex(0);
    setPlaying(false);
    setSelected(null);
  }

  function start() {
    setSelected(null);
    setStepIndex(0);
    setPlaying(true);
  }

  function go(i: number) {
    setPlaying(false);
    setStepIndex(Math.max(0, Math.min(struct.length - 1, i)));
  }

  const px = (id: DnsNodeId): Pt => ({ x: POS[id].x * size.w, y: POS[id].y * size.h });

  const pathFor = (from: DnsNodeId, to: DnsNodeId) => {
    const a = px(from);
    const b = px(to);
    const cp = controlPoint(a, b);
    return `M ${a.x} ${a.y} Q ${cp.x} ${cp.y} ${b.x} ${b.y}`;
  };

  // Sampled points for the traveling packet on the active edge.
  const packetTrack = useMemo(() => {
    if (!current?.edge || size.w === 0) return null;
    const a = px(current.edge.from);
    const b = px(current.edge.to);
    const cp = controlPoint(a, b);
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const p = quadAt(a, cp, b, i / SAMPLES);
      xs.push(p.x - 14);
      ys.push(p.y - 14);
    }
    return { xs, ys };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, size.w, size.h]);

  const activeColor = current?.edge ? KIND_COLOR[current.edge.kind] : 'transparent';
  const selectedNode = selected ? c.nodes[selected] : null;
  const SelectedIcon = selected ? ICON[selected] : null;

  const compareCols = [
    { key: 'recursive' as const, title: c.ui.recursive, icon: CornerDownLeft },
    { key: 'iterative' as const, title: c.ui.iterative, icon: GitBranch },
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

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-surface p-1">
          {(['iterative', 'recursive'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                mode === m ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
              )}
            >
              {c.ui[m]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">
            {c.ui.step} {stepIndex + 1} {c.ui.of} {struct.length}
          </span>
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30"
          >
            {playing ? (
              <RotateCcw className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4 fill-current" aria-hidden />
            )}
            {atEnd && !playing ? c.ui.replay : c.ui.start}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: `${((stepIndex + 1) / struct.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Diagram */}
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
            {c.ui.diagramTitle}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface/40">
            <div ref={ref} className="relative h-[340px] min-w-[560px]">
              <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                {size.w > 0 &&
                  TOPOLOGY.map(([a, b]) => (
                    <path
                      key={`${a}-${b}`}
                      d={pathFor(a, b)}
                      fill="none"
                      stroke="rgb(var(--border))"
                      strokeWidth={1.5}
                    />
                  ))}

                {/* Active edge */}
                {size.w > 0 && current?.edge && (
                  <g>
                    <path
                      d={pathFor(current.edge.from, current.edge.to)}
                      fill="none"
                      stroke={activeColor}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 6px ${activeColor})` }}
                    />
                    <path
                      d={pathFor(current.edge.from, current.edge.to)}
                      fill="none"
                      stroke="white"
                      strokeOpacity={0.7}
                      strokeWidth={1.5}
                      className="flow-dash"
                    />
                  </g>
                )}

                {/* Recursive "the resolver works for you" burst */}
                {size.w > 0 &&
                  current?.focus === 'resolver' &&
                  current.visits?.map((v) => (
                    <path
                      key={v}
                      d={pathFor('resolver', v)}
                      fill="none"
                      stroke={KIND_COLOR.referral}
                      strokeWidth={2}
                      strokeLinecap="round"
                      className="flow-dash"
                      style={{ filter: `drop-shadow(0 0 5px ${KIND_COLOR.referral})` }}
                    />
                  ))}
              </svg>

              {/* Traveling packet */}
              <AnimatePresence>
                {packetTrack && current?.edge && current.packet && (
                  <motion.div
                    key={`${mode}-${stepIndex}`}
                    className="pointer-events-none absolute left-0 top-0 z-20"
                    initial={{ x: packetTrack.xs[0], y: packetTrack.ys[0], opacity: 0 }}
                    animate={{ x: packetTrack.xs, y: packetTrack.ys, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.95, ease: 'easeInOut' }}
                  >
                    <div
                      className="relative grid h-7 w-7 place-items-center rounded-full text-white"
                      style={{ background: activeColor, boxShadow: `0 0 18px ${activeColor}` }}
                    >
                      <motion.span
                        className="h-2 w-2 rounded-full bg-white"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                      <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg/95 px-1.5 py-0.5 font-mono text-[0.65rem] text-fg shadow-sm">
                        {c.packets[current.packet]}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nodes */}
              {(Object.keys(POS) as DnsNodeId[]).map((id) => {
                const Icon = ICON[id];
                const isActive =
                  current?.edge?.from === id || current?.edge?.to === id || current?.focus === id;
                const isVisited = visited.has(id);
                const isSelected = selected === id;
                const isPinged = current?.focus === 'resolver' && current.visits?.includes(id);
                return (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => setSelected((s) => (s === id ? null : id))}
                    animate={{ scale: isActive ? 1.07 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ left: `${POS[id].x * 100}%`, top: `${POS[id].y * 100}%` }}
                    className="absolute z-10 flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
                  >
                    <span
                      className={cn(
                        'relative grid h-12 w-12 place-items-center rounded-2xl border bg-surface transition-all duration-300',
                        isActive
                          ? 'border-accent text-accent shadow-lg shadow-accent/25'
                          : isVisited
                            ? 'border-accent/40 text-accent'
                            : 'border-border text-muted opacity-60',
                        isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                      {(current?.focus === id || isPinged) && (
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-2xl ring-2 ring-accent"
                          animate={{ opacity: [0.15, 0.8, 0.15] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                        />
                      )}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-semibold leading-tight transition-colors',
                        isActive || isVisited ? 'text-fg' : 'text-muted',
                      )}
                    >
                      {c.nodes[id].label}
                    </span>
                    <span className="-mt-1 font-mono text-[0.62rem] leading-tight text-muted">
                      {c.nodes[id].sublabel}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted">{c.ui.tapHint}</p>
        </div>

        {/* Step timeline */}
        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <ol className="space-y-1">
            {texts.map((s, i) => {
              const isCurrent = i === stepIndex;
              const done = i < stepIndex;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left transition-colors',
                      isCurrent ? 'bg-accent/10' : 'hover:bg-surface-2',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[0.65rem] font-bold transition-colors',
                        isCurrent
                          ? 'bg-accent text-accent-fg'
                          : done
                            ? 'bg-accent/20 text-accent'
                            : 'bg-surface-2 text-muted',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block text-sm font-medium leading-snug',
                          isCurrent ? 'text-fg' : done ? 'text-fg/75' : 'text-muted',
                        )}
                      >
                        {s.title}
                      </span>
                      <AnimatePresence initial={false}>
                        {isCurrent && (
                          <motion.span
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="block overflow-hidden text-xs leading-relaxed text-muted"
                          >
                            <span className="block pt-1">{s.text}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs leading-relaxed text-muted">
              {mode === 'recursive' ? c.ui.recursiveHint : c.ui.iterativeHint}
            </p>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => go(stepIndex - 1)}
                disabled={stepIndex === 0}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted transition-colors hover:text-fg disabled:opacity-40"
                aria-label={c.ui.prev}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(stepIndex + 1)}
                disabled={atEnd}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted transition-colors hover:text-fg disabled:opacity-40"
                aria-label={c.ui.next}
              >
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Node detail */}
      <AnimatePresence mode="wait">
        {selected && selectedNode && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-5 flex items-start gap-4 rounded-2xl border border-accent/30 bg-accent/[0.06] p-5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
              {SelectedIcon && <SelectedIcon className="h-5 w-5" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-semibold text-fg">{selectedNode.label}</h4>
                <span className="font-mono text-xs text-muted">{selectedNode.sublabel}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-fg/80">{selectedNode.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="shrink-0 rounded-md p-1 text-muted transition-colors hover:text-fg"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recursive vs iterative compare */}
      <div className="mt-10">
        <h4 className="font-display text-lg font-semibold text-fg">{c.compare.title}</h4>
        <p className="mt-1 text-sm text-muted">{c.compare.subtitle}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {compareCols.map((col, ci) => (
            <motion.div
              key={col.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: ci * 0.08 }}
              className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent ring-1 ring-inset ring-accent/20">
                  <col.icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
                </span>
                <h5 className="font-display text-base font-semibold text-fg">{col.title}</h5>
              </div>
              <dl className="space-y-3">
                {c.compare.rows.map((row) => (
                  <div
                    key={row.aspect}
                    className="border-t border-border pt-3 first:border-0 first:pt-0"
                  >
                    <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                      {row.aspect}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-fg/85">{row[col.key]}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
