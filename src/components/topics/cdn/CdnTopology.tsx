'use client';

import { useEffect, useRef, useState } from 'react';
import { type LucideIcon } from 'lucide-react';
import { Network, Play, Server, Users, Warehouse } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { cdnContent } from './content';
import { SceneRails, SceneNode, Packet, type Pt } from './scene';

type Mode = 'hier' | 'horiz';
type TopoNode = { id: string; pt: Pt; icon: LucideIcon; label: string };

const SEG_MS = 800;
const ACCENT = 'rgb(var(--accent))';

export function CdnTopology({ locale }: { locale: Locale }) {
  const c = cdnContent[locale].topology;
  const [mode, setMode] = useState<Mode>('hier');
  const [step, setStep] = useState(0);
  const [tracing, setTracing] = useState(false);
  const [packetKey, setPacketKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hierNodes: TopoNode[] = [
    { id: 'origin', pt: { x: 50, y: 12 }, icon: Warehouse, label: c.origin },
    { id: 'p0', pt: { x: 28, y: 45 }, icon: Network, label: c.parent },
    { id: 'p1', pt: { x: 72, y: 45 }, icon: Network, label: c.parent },
    { id: 'c0', pt: { x: 13, y: 78 }, icon: Server, label: c.child },
    { id: 'c1', pt: { x: 38, y: 78 }, icon: Server, label: c.child },
    { id: 'c2', pt: { x: 62, y: 78 }, icon: Server, label: c.child },
    { id: 'c3', pt: { x: 87, y: 78 }, icon: Server, label: c.child },
  ];
  const hierRails = [
    ['origin', 'p0'],
    ['origin', 'p1'],
    ['p0', 'c0'],
    ['p0', 'c1'],
    ['p1', 'c2'],
    ['p1', 'c3'],
  ];
  const hierPath = ['origin', 'p0', 'c1'];

  const horizNodes: TopoNode[] = [
    { id: 'origin', pt: { x: 50, y: 14 }, icon: Warehouse, label: c.origin },
    { id: 'e0', pt: { x: 12, y: 72 }, icon: Server, label: c.edge },
    { id: 'e1', pt: { x: 31, y: 72 }, icon: Server, label: c.edge },
    { id: 'e2', pt: { x: 50, y: 72 }, icon: Server, label: c.edge },
    { id: 'e3', pt: { x: 69, y: 72 }, icon: Server, label: c.edge },
    { id: 'e4', pt: { x: 88, y: 72 }, icon: Server, label: c.edge },
  ];
  const horizRails = horizNodes.slice(1).map((n) => ['origin', n.id]);
  const horizPath = ['origin', 'e2'];

  const nodes = mode === 'hier' ? hierNodes : horizNodes;
  const rails = mode === 'hier' ? hierRails : horizRails;
  const path = mode === 'hier' ? hierPath : horizPath;
  const posOf = (id: string) => nodes.find((n) => n.id === id)!.pt;
  const lit = new Set(path.slice(0, step));

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  function switchMode(m: Mode) {
    if (m === mode) return;
    clearTimers();
    setMode(m);
    setStep(0);
    setTracing(false);
  }

  function trace() {
    if (tracing) return;
    clearTimers();
    setStep(1);
    setPacketKey((k) => k + 1);
    setTracing(true);
    for (let i = 1; i < path.length; i++) {
      timers.current.push(setTimeout(() => setStep(i + 1), i * SEG_MS));
    }
    timers.current.push(setTimeout(() => setTracing(false), path.length * SEG_MS));
  }

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(['hier', 'horiz'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === m ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {m === 'hier' ? c.hierarchical : c.horizontal}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={trace}
            disabled={tracing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-70"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden />
            {c.trace}
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-muted">
          {mode === 'hier' ? c.hierHint : c.horizHint}
        </p>

        <div className="relative h-[20rem]">
          <SceneRails
            edges={rails.map(([a, b]) => ({
              a: posOf(a),
              b: posOf(b),
              active: lit.has(a) && lit.has(b),
            }))}
          />
          {nodes.map((n) => (
            <SceneNode
              key={n.id}
              pt={n.pt}
              icon={n.icon}
              label={n.label}
              active={lit.has(n.id)}
            />
          ))}

          {/* users tier */}
          <div
            className="absolute inset-x-0 flex items-center justify-center gap-1.5 font-mono text-[0.7rem] text-muted"
            style={{ top: '96%' }}
          >
            <Users className="h-3.5 w-3.5" aria-hidden />
            {c.users}
          </div>

          {tracing && (
            <Packet
              key={packetKey}
              points={path.map(posOf)}
              color={ACCENT}
              duration={((path.length - 1) * SEG_MS) / 1000}
            />
          )}
        </div>

        <p className="mt-3 text-sm text-fg/80">
          {mode === 'hier' ? c.hierCaption : c.horizCaption}
        </p>
      </div>
    </div>
  );
}
