'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, RotateCcw, X } from 'lucide-react';
import {
  FlowDiagram,
  type FlowNode,
  type FlowEdge,
  type EdgeKind,
} from './FlowDiagram';
import { Stepper } from './Stepper';
import { cn } from '@/lib/utils';

export type FlowPlayerStep = {
  title: string;
  text: string;
  edge?: { from: string; to: string; kind: EdgeKind };
  focus?: string;
  /** Already-localized label for the traveling packet. */
  packet?: string;
  /** Extra node ids to mark as visited at this step. */
  visits?: string[];
};

export type FlowPlayerMode = { id: string; label: string; hint: string };

export type FlowPlayerLabels = {
  start: string;
  replay: string;
  step: string;
  of: string;
  prev: string;
  next: string;
  tapHint: string;
  diagramTitle: string;
};

const STEP_MS = 1350;

/**
 * Reusable "watch the system work" player: animated FlowDiagram + synced
 * Stepper + play/step controls + clickable node details, with an optional
 * mode toggle. DNS and CDN (and future topics) drive it with their own data.
 */
export function FlowPlayer({
  nodes,
  edges,
  stepsByMode,
  modes,
  initialMode,
  nodeDetails,
  labels,
  showTopology = true,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  stepsByMode: Record<string, FlowPlayerStep[]>;
  modes?: FlowPlayerMode[];
  initialMode?: string;
  nodeDetails: Record<string, string>;
  labels: FlowPlayerLabels;
  showTopology?: boolean;
}) {
  const firstMode = initialMode ?? modes?.[0]?.id ?? Object.keys(stepsByMode)[0];
  const [mode, setMode] = useState(firstMode);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const steps = useMemo(() => stepsByMode[mode] ?? [], [stepsByMode, mode]);
  const current = steps[stepIndex];

  const visited = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i <= stepIndex && i < steps.length; i++) {
      const s = steps[i];
      if (s.edge) {
        set.add(s.edge.from);
        set.add(s.edge.to);
      }
      if (s.focus) set.add(s.focus);
      s.visits?.forEach((v) => set.add(v));
    }
    return [...set];
  }, [steps, stepIndex]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, stepIndex, steps.length]);

  function switchMode(next: string) {
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
    setStepIndex(Math.max(0, Math.min(steps.length - 1, i)));
  }

  const atEnd = stepIndex >= steps.length - 1;
  const activeMode = modes?.find((m) => m.id === mode);
  const SelectedIcon = selected
    ? nodes.find((n) => n.id === selected)?.icon
    : undefined;
  const selectedNode = selected ? nodes.find((n) => n.id === selected) : undefined;

  return (
    <div className="not-prose">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {modes && modes.length > 1 ? (
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => switchMode(m.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === m.id ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">
            {labels.step} {stepIndex + 1} {labels.of} {steps.length}
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
            {atEnd && !playing ? labels.replay : labels.start}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
            {labels.diagramTitle}
          </p>
          <FlowDiagram
            nodes={nodes}
            edges={edges}
            active={current?.edge ?? null}
            focusId={current?.focus ?? null}
            visited={visited}
            selectedId={selected}
            onSelect={setSelected}
            packetLabel={current?.packet}
            tick={`${mode}-${stepIndex}`}
            showTopology={showTopology}
          />
          <p className="mt-2 text-center text-xs text-muted">{labels.tapHint}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <Stepper steps={steps} activeIndex={stepIndex} onSelect={go} />
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs leading-relaxed text-muted">{activeMode?.hint}</p>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => go(stepIndex - 1)}
                disabled={stepIndex === 0}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted transition-colors hover:text-fg disabled:opacity-40"
                aria-label={labels.prev}
              >
                <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(stepIndex + 1)}
                disabled={atEnd}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted transition-colors hover:text-fg disabled:opacity-40"
                aria-label={labels.next}
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
                <h4 className="font-display font-semibold text-fg">
                  {selectedNode.label}
                </h4>
                {selectedNode.sublabel && (
                  <span className="font-mono text-xs text-muted">
                    {selectedNode.sublabel}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-fg/80">
                {nodeDetails[selected]}
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
