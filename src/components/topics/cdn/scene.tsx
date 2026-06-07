'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared percentage-positioned scene primitives for CDN visualizations. */
export type Pt = { x: number; y: number };

export type RailEdge = { a: Pt; b: Pt; active?: boolean };

/**
 * Draws all connectors in a single SVG overlay. Coordinates are percentages
 * (0–100) on both axes; `preserveAspectRatio="none"` maps them straight to the
 * container's width/height, so lines connect node centers exactly on any aspect
 * ratio. `vector-effect="non-scaling-stroke"` keeps the stroke width uniform.
 */
export function SceneRails({ edges }: { edges: RailEdge[] }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.a.x}
          y1={e.a.y}
          x2={e.b.x}
          y2={e.b.y}
          stroke={e.active ? 'rgb(var(--accent))' : 'rgb(var(--border))'}
          strokeWidth={e.active ? 2 : 1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={
            e.active
              ? { filter: 'drop-shadow(0 0 4px rgb(var(--accent)))' }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

export function SceneNode({
  pt,
  icon: Icon,
  label,
  active,
  badge,
  badgeColor,
}: {
  pt: Pt;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <>
      <motion.div
        animate={{ scale: active ? 1.08 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'absolute z-[5] grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border bg-surface transition-colors',
          active ? 'border-accent text-accent shadow-md shadow-accent/20' : 'border-border text-muted',
        )}
        style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </motion.div>
      <span
        className="absolute z-[5] -translate-x-1/2 whitespace-nowrap font-mono text-[0.7rem] text-muted"
        style={{ left: `${pt.x}%`, top: `calc(${pt.y}% + 1.7rem)` }}
      >
        {label}
      </span>
      <AnimatePresence>
        {badge && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold text-white"
            style={{ left: `${pt.x}%`, top: `calc(${pt.y}% - 1.4rem)`, background: badgeColor }}
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}

export function Packet({
  points,
  color,
  duration,
  delay = 0,
  onDone,
}: {
  points: Pt[];
  color: string;
  duration: number;
  delay?: number;
  onDone?: () => void;
}) {
  const times = points.map((_, i) => i / (points.length - 1));
  return (
    <motion.div
      className="absolute z-20 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      initial={{ left: `${points[0].x}%`, top: `${points[0].y}%`, opacity: 0 }}
      animate={{
        left: points.map((p) => `${p.x}%`),
        top: points.map((p) => `${p.y}%`),
        opacity: points.map((_, i) => (i === points.length - 1 ? 0 : 1)),
      }}
      transition={{ duration, delay, times, ease: 'easeInOut' }}
      onAnimationComplete={onDone}
    />
  );
}
