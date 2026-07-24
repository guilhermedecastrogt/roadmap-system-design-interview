'use client';

import { motion } from 'framer-motion';
import {
  Boxes,
  Database,
  HardDrive,
  Search,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type StoreId } from './content';

/** Section heading shared by every interactive panel in this lesson. */
export function TwHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

/** Consistent card wrapper for the interactive stage of each panel. */
export function TwStage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-5 rounded-2xl border border-border bg-surface/40 p-5', className)}>
      {children}
    </div>
  );
}

/** Colour + icon identity per backing store, reused across panels. */
export const STORE_META: Record<StoreId, { icon: LucideIcon; color: string; ring: string }> = {
  redis: { icon: Zap, color: 'rgb(239 68 68)', ring: 'border-red-500/50' },
  mongodb: { icon: Database, color: 'rgb(16 185 129)', ring: 'border-emerald-500/50' },
  kafka: { icon: Boxes, color: 'rgb(139 92 246)', ring: 'border-violet-500/50' },
  elasticsearch: { icon: Search, color: 'rgb(234 179 8)', ring: 'border-yellow-500/50' },
  s3: { icon: HardDrive, color: 'rgb(56 189 248)', ring: 'border-sky-500/50' },
};

/**
 * A pill-style node placed on a percentage-positioned scene. Wider than the
 * bare icon `SceneNode` so it can carry a store/service name, and it can pulse
 * to signal it is currently handling the request.
 */
export function TwNode({
  x,
  y,
  icon: Icon,
  label,
  active,
  color,
  badge,
  badgeColor,
  width = 'w-28',
}: {
  x: number;
  y: number;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  color?: string;
  badge?: string;
  badgeColor?: string;
  width?: string;
}) {
  const tint = color ?? 'rgb(var(--accent))';
  return (
    <>
      <motion.div
        animate={{ scale: active ? 1.06 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'absolute z-[5] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-xl border bg-surface px-2.5 py-1.5 shadow-sm',
          width,
        )}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          borderColor: active ? tint : 'rgb(var(--border))',
          boxShadow: active ? `0 0 0 1px ${tint}, 0 4px 16px ${tint}33` : undefined,
        }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: active ? tint : 'rgb(var(--muted))' }} aria-hidden />
        <span className="truncate text-xs font-semibold text-fg">{label}</span>
      </motion.div>
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: 4, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-white"
          style={{ left: `${x}%`, top: `calc(${y}% - 1.9rem)`, background: badgeColor ?? tint }}
        >
          {badge}
        </motion.span>
      )}
    </>
  );
}

/** Primary action button, matching the house style used across lessons. */
export function TwButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:opacity-60',
        variant === 'primary'
          ? 'bg-accent text-accent-fg shadow-sm hover:shadow-md hover:shadow-accent/30'
          : 'border border-border font-medium text-muted hover:bg-surface-2 hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}
