'use client';

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FlowNode = {
  id: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  /** Grid column 0..2 (left → right). Nodes in the same column stack. */
  col: number;
};

export type FlowEdge = { from: string; to: string; dashed?: boolean };

export type EdgeKind =
  | 'request'
  | 'response'
  | 'referral'
  | 'replicate'
  | 'control';

export type ActiveEdge = {
  from: string;
  to: string;
  kind: EdgeKind;
} | null;

type Point = { x: number; y: number };

const kindColor: Record<EdgeKind, string> = {
  request: 'rgb(var(--accent))',
  response: 'rgb(16 185 129)', // emerald
  referral: 'rgb(245 158 11)', // amber
  replicate: 'rgb(139 92 246)', // violet
  control: 'rgb(148 163 184)', // slate
};

/**
 * Reusable animated flow diagram for system-design topics. Lays nodes out in
 * up to three responsive columns, measures their real positions, and draws
 * animated connectors + a traveling packet between the active pair. Geometry
 * is measured from the DOM, so the diagram stays correct on any screen size.
 */
export function FlowDiagram({
  nodes,
  edges,
  active,
  visited = [],
  selectedId,
  onSelect,
  packetLabel,
  focusId,
  tick = 0,
  showTopology = true,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  active: ActiveEdge;
  visited?: string[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  packetLabel?: string;
  /** Spotlight a node without an active edge (e.g. "resolver is working"). */
  focusId?: string | null;
  /** Changes per step to force the packet animation to replay. */
  tick?: number | string;
  /**
   * Draw the faint static connections between all nodes. Turn off for dense
   * graphs (e.g. CDN) where only the active step's arrow should show, so the
   * flow stays readable.
   */
  showTopology?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<Map<string, HTMLElement>>(new Map());
  const [centers, setCenters] = useState<Record<string, Point>>({});

  const setNodeRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) nodeEls.current.set(id, el);
      else nodeEls.current.delete(id);
    },
    [],
  );

  const measure = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const cRect = c.getBoundingClientRect();
    const next: Record<string, Point> = {};
    nodeEls.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      next[id] = {
        x: r.left - cRect.left + r.width / 2,
        y: r.top - cRect.top + r.height / 2,
      };
    });
    setCenters(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(c);
    nodeEls.current.forEach((el) => ro.observe(el));
    window.addEventListener('resize', measure);
    // Re-measure once fonts settle.
    const t = setTimeout(measure, 250);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [measure, nodes]);

  const cols: FlowNode[][] = [[], [], []];
  for (const n of nodes) cols[n.col]?.push(n);

  const activeFrom = active && centers[active.from];
  const activeTo = active && centers[active.to];
  const activeColor = active ? kindColor[active.kind] : 'transparent';

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface/40 p-4 sm:p-6"
    >
      {/* SVG connector layer */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <marker
            id="flow-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={activeColor} />
          </marker>
        </defs>

        {/* Faint topology */}
        {showTopology &&
          edges.map((e) => {
            const a = centers[e.from];
            const b = centers[e.to];
            if (!a || !b) return null;
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgb(var(--border))"
                strokeWidth={1.5}
                strokeDasharray={e.dashed ? '4 5' : undefined}
              />
            );
          })}

        {/* Active edge */}
        {activeFrom && activeTo && (
          <g>
            <line
              x1={activeFrom.x}
              y1={activeFrom.y}
              x2={activeTo.x}
              y2={activeTo.y}
              stroke={activeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              markerEnd="url(#flow-arrow)"
              style={{ filter: 'drop-shadow(0 0 6px ' + activeColor + ')' }}
            />
            <line
              x1={activeFrom.x}
              y1={activeFrom.y}
              x2={activeTo.x}
              y2={activeTo.y}
              stroke="white"
              strokeOpacity={0.7}
              strokeWidth={1.5}
              className="flow-dash"
            />
          </g>
        )}
      </svg>

      {/* Traveling packet */}
      <AnimatePresence>
        {activeFrom && activeTo && packetLabel && (
          <motion.div
            key={`${active!.from}-${active!.to}-${tick}`}
            className="pointer-events-none absolute left-0 top-0 z-20"
            initial={{ x: activeFrom.x - 16, y: activeFrom.y - 16, opacity: 0, scale: 0.5 }}
            animate={{ x: activeTo.x - 16, y: activeTo.y - 16, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative grid h-8 w-8 place-items-center rounded-full text-white shadow-lg"
              style={{
                background: activeColor,
                boxShadow: `0 0 18px ${activeColor}`,
              }}
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-white"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              {packetLabel && (
                <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg/95 px-1.5 py-0.5 font-mono text-[0.65rem] text-fg shadow-sm">
                  {packetLabel}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node grid */}
      <div className="relative z-10 grid grid-cols-1 items-center gap-6 sm:grid-cols-3 sm:gap-4">
        {cols.map((colNodes, ci) => (
          <div key={ci} className="flex flex-col items-center justify-center gap-5">
            {colNodes.map((n) => {
              const isFocus = focusId === n.id;
              const isActive = active?.from === n.id || active?.to === n.id || isFocus;
              const isVisited = visited.includes(n.id);
              const isSelected = selectedId === n.id;
              const Icon = n.icon;
              return (
                <motion.button
                  key={n.id}
                  type="button"
                  ref={setNodeRef(n.id)}
                  onClick={() => onSelect?.(n.id)}
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={cn(
                    'group relative flex w-full max-w-[15rem] items-center gap-3 rounded-xl border bg-surface px-3 py-2.5 text-left transition-all duration-300',
                    isActive
                      ? 'border-accent shadow-lg shadow-accent/20'
                      : isVisited
                        ? 'border-accent/40'
                        : 'border-border hover:border-accent/40',
                    !isActive && !isVisited && !isSelected && 'opacity-55',
                    isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
                  )}
                >
                  {isFocus && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-xl ring-2 ring-accent"
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                    />
                  )}
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors',
                      isActive || isVisited
                        ? 'bg-accent/15 text-accent'
                        : 'bg-surface-2 text-muted group-hover:text-fg',
                    )}
                  >
                    <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight text-fg">
                      {n.label}
                    </span>
                    {n.sublabel && (
                      <span className="mt-0.5 block font-mono text-[0.7rem] leading-tight text-muted">
                        {n.sublabel}
                      </span>
                    )}
                  </span>
                  {isVisited && !isActive && (
                    <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-bg bg-accent" />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
