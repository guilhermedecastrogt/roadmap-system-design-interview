'use client';

import {
  BarChart3,
  Columns3,
  FileJson,
  KeyRound,
  Search,
  Sparkles,
  Table2,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';
import { type DbTypeId } from './content';

/** Small heading used above each interactive section. */
export function DbHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

/** One icon per database family, shared by the decision map and the explorer. */
export const DB_TYPE_ICONS: Record<DbTypeId, LucideIcon> = {
  sql: Table2,
  kv: KeyRound,
  document: FileJson,
  widecolumn: Columns3,
  graph: Waypoints,
  search: Search,
  vector: Sparkles,
  analytics: BarChart3,
};

/** Accent text class per family, for consistent colour-coding across visuals. */
export const DB_TYPE_TEXT: Record<DbTypeId, string> = {
  sql: 'text-accent',
  kv: 'text-rose-500',
  document: 'text-emerald-500',
  widecolumn: 'text-amber-500',
  graph: 'text-violet-500',
  search: 'text-sky-500',
  vector: 'text-fuchsia-500',
  analytics: 'text-teal-500',
};
