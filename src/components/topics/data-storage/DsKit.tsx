'use client';

import {
  Database,
  FileAudio,
  FileCode2,
  FileJson,
  FileText,
  FolderTree,
  Image,
  Package,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { type FileKind, type StoreKind } from './content';

/** Small heading used above each interactive section. */
export function DsHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

/** One icon per file kind, shared by the explorer and the upload lab. */
export const FILE_ICONS: Record<FileKind, LucideIcon> = {
  img: Image,
  vid: Video,
  audio: FileAudio,
  log: FileText,
  json: FileJson,
  html: FileCode2,
};

/** Accent text class per file kind, for consistent colour-coding. */
export const FILE_TEXT: Record<FileKind, string> = {
  img: 'text-emerald-500',
  vid: 'text-violet-500',
  audio: 'text-rose-500',
  log: 'text-amber-500',
  json: 'text-sky-500',
  html: 'text-teal-500',
};

/** One icon per storage kind, shared by the fit matrix. */
export const STORE_ICONS: Record<StoreKind, LucideIcon> = {
  db: Database,
  fs: FolderTree,
  obj: Package,
};
