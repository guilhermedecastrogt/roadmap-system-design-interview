'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Database,
  Globe,
  Network,
  Play,
  RotateCcw,
  ServerCog,
  X,
} from 'lucide-react';
import {
  FlowDiagram,
  type FlowNode,
  type FlowEdge,
  type EdgeKind,
} from '@/components/flow/FlowDiagram';
import { Stepper } from '@/components/flow/Stepper';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dnsContent, type DnsNodeId } from './content';

type Mode = 'recursive' | 'iterative';
type PacketKey = 'query' | 'referral' | 'ip';
type FlowStep = {
  edge?: { from: DnsNodeId; to: DnsNodeId; kind: EdgeKind };
  packet?: PacketKey;
  focus?: DnsNodeId;
};

const iconById: Record<DnsNodeId, FlowNode['icon']> = {
  browser: Globe,
  resolver: ServerCog,
  root: Network,
  tld: Building2,
  auth: Database,
};

const colById: Record<DnsNodeId, number> = {
  browser: 0,
  resolver: 1,
  root: 2,
  tld: 2,
  auth: 2,
};

const edges: FlowEdge[] = [
  { from: 'browser', to: 'resolver' },
  { from: 'resolver', to: 'root' },
  { from: 'resolver', to: 'tld' },
  { from: 'resolver', to: 'auth' },
];

const iterativeFlow: FlowStep[] = [
  { edge: { from: 'browser', to: 'resolver', kind: 'request' }, packet: 'query' },
  { edge: { from: 'resolver', to: 'root', kind: 'request' }, packet: 'query' },
  { edge: { from: 'root', to: 'resolver', kind: 'referral' }, packet: 'referral' },
  { edge: { from: 'resolver', to: 'tld', kind: 'request' }, packet: 'query' },
  { edge: { from: 'tld', to: 'resolver', kind: 'referral' }, packet: 'referral' },
  { edge: { from: 'resolver', to: 'auth', kind: 'request' }, packet: 'query' },
  { edge: { from: 'auth', to: 'resolver', kind: 'response' }, packet: 'ip' },
  { edge: { from: 'resolver', to: 'browser', kind: 'response' }, packet: 'ip' },
];

const recursiveFlow: FlowStep[] = [
  { edge: { from: 'browser', to: 'resolver', kind: 'request' }, packet: 'query' },
  { focus: 'resolver' },
  { edge: { from: 'resolver', to: 'browser', kind: 'response' }, packet: 'ip' },
];

const STEP_MS = 1350;

export function DnsExperience({ locale }: { locale: Locale }) {
  const c = dnsContent[locale];
  const [mode, setMode] = useState<Mode>('iterative');
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<DnsNodeId | null>(null);

  const flow = mode === 'iterative' ? iterativeFlow : recursiveFlow;
  const textSteps = mode === 'iterative' ? c.iterative : c.recursive;
  const current = flow[stepIndex];

  const nodes: FlowNode[] = useMemo(
    () =>
      (Object.keys(c.nodes) as DnsNodeId[]).map((id) => ({
        id,
        label: c.nodes[id].label,
        sublabel: c.nodes[id].sublabel,
        icon: iconById[id],
        col: colById[id],
      })),
    [c],
  );

  // Nodes touched up to and including the current step.
  const visited = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i <= stepIndex && i < flow.length; i++) {
      const s = flow[i];
      if (s.edge) {
        set.add(s.edge.from);
        set.add(s.edge.to);
      }
      if (s.focus === 'resolver') {
        ['resolver', 'root', 'tld', 'auth'].forEach((n) => set.add(n));
      } else if (s.focus) {
        set.add(s.focus);
      }
    }
    return [...set];
  }, [flow, stepIndex]);

  // Auto-advance while playing.
  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= flow.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, stepIndex, flow.length]);

  function switchMode(next: Mode) {
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
    setStepIndex(Math.max(0, Math.min(flow.length - 1, i)));
  }

  const atEnd = stepIndex >= flow.length - 1;
  const packetLabel = current?.packet ? c.packets[current.packet] : undefined;

  return (
    <div className="not-prose">
      {/* Translator hero */}
      <div className="mb-5 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface/50 p-5 text-center sm:flex-row sm:justify-center sm:gap-5 sm:text-left">
        <span className="rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm font-semibold text-fg">
          {c.translator.from}
        </span>
        <motion.span
          animate={{ x: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-accent"
        >
          <ArrowRight className="h-5 w-5" aria-hidden />
        </motion.span>
        <span className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-sm font-semibold text-accent">
          {c.translator.to}
        </span>
        <span className="max-w-xs text-xs text-muted sm:ml-2">{c.translator.note}</span>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-surface p-1">
          {(['iterative', 'recursive'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                mode === m
                  ? 'bg-accent text-accent-fg'
                  : 'text-muted hover:text-fg',
              )}
            >
              {m === 'iterative' ? c.ui.iterative : c.ui.recursive}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">
            {c.ui.step} {stepIndex + 1} {c.ui.of} {flow.length}
          </span>
          <button
            type="button"
            onClick={start}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30"
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

      {/* Progress bar */}
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: `${((stepIndex + 1) / flow.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        {/* Diagram */}
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
            {c.ui.diagramTitle}
          </p>
          <FlowDiagram
            nodes={nodes}
            edges={edges}
            active={current?.edge ?? null}
            focusId={current?.focus ?? null}
            visited={visited}
            selectedId={selected}
            onSelect={(id) => setSelected(id as DnsNodeId)}
            packetLabel={packetLabel}
            tick={`${mode}-${stepIndex}`}
          />
          <p className="mt-2 text-center text-xs text-muted">{c.ui.tapHint}</p>
        </div>

        {/* Stepper + hint */}
        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <Stepper steps={textSteps} activeIndex={stepIndex} onSelect={go} />
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs leading-relaxed text-muted">
              {mode === 'iterative' ? c.ui.iterativeHint : c.ui.recursiveHint}
            </p>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => go(stepIndex - 1)}
                disabled={stepIndex === 0}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted transition-colors hover:text-fg disabled:opacity-40"
                aria-label={c.ui.prev}
              >
                <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
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

      {/* Selected node detail */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-5 flex items-start gap-4 rounded-2xl border border-accent/30 bg-accent/[0.06] p-5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
              {(() => {
                const Icon = iconById[selected];
                return <Icon className="h-5 w-5" aria-hidden />;
              })()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-semibold text-fg">
                  {c.nodes[selected].label}
                </h4>
                <span className="font-mono text-xs text-muted">
                  {c.nodes[selected].sublabel}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-fg/80">
                {c.nodes[selected].detail}
              </p>
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
    </div>
  );
}
