'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Fingerprint,
  Folder,
  FolderOpen,
  HardDrive,
  Info,
  Minus,
  Package,
  Tags,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dataStorageContent, type BucketObject, type FileKind } from './content';
import { DsHeading, FILE_ICONS, FILE_TEXT } from './DsKit';

type View = 'fs' | 'obj';

/** The same six files, shown hierarchically (fs) and as flat keys (bucket). */
const OBJECTS: BucketObject[] = [
  { key: 'uploads/2026/03/beach.jpg', kind: 'img', size: '2.4 MB', contentType: 'image/jpeg' },
  { key: 'uploads/2026/03/trip.mp4', kind: 'vid', size: '1.8 GB', contentType: 'video/mp4' },
  { key: 'uploads/2026/04/episode-12.mp3', kind: 'audio', size: '82 MB', contentType: 'audio/mpeg' },
  { key: 'logs/2026-07-16.log.gz', kind: 'log', size: '512 MB', contentType: 'application/gzip' },
  { key: 'exports/users.json', kind: 'json', size: '4.9 MB', contentType: 'application/json' },
  { key: 'site/index.html', kind: 'html', size: '12 KB', contentType: 'text/html' },
];

/** Deterministic fake IDs/dates so both locales render identical objects. */
const OBJECT_META: Record<string, { id: string; created: string }> = {
  'uploads/2026/03/beach.jpg': { id: '9f2c-4b71-a0d3-58e6', created: '2026-03-14 18:22' },
  'uploads/2026/03/trip.mp4': { id: '1e8a-42c9-b5f0-7d13', created: '2026-03-21 09:04' },
  'uploads/2026/04/episode-12.mp3': { id: '6b4d-49e2-8ca1-f375', created: '2026-04-02 12:47' },
  'logs/2026-07-16.log.gz': { id: 'c7a9-4f30-91be-2d68', created: '2026-07-16 23:59' },
  'exports/users.json': { id: '3d5f-471b-ac82-90e4', created: '2026-06-30 06:15' },
  'site/index.html': { id: 'ab12-4c8d-97f6-31e0', created: '2026-05-11 15:30' },
};

type TreeNode = { name: string; children?: TreeNode[]; file?: BucketObject };

/** Build the folder tree from the flat keys (the fs view of the same data). */
function buildTree(): TreeNode[] {
  const root: TreeNode[] = [];
  for (const obj of OBJECTS) {
    const parts = obj.key.split('/');
    let level = root;
    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;
      let node = level.find((n) => n.name === part && !!n.children === !isFile);
      if (!node) {
        node = isFile ? { name: part, file: obj } : { name: part, children: [] };
        level.push(node);
      }
      if (!isFile) level = node.children!;
    });
  }
  return root;
}

const TREE = buildTree();

/**
 * Storage explorer: flip the same six files between a hierarchical
 * file-system tree and a flat object-storage bucket. Tapping an object opens
 * its anatomy — data (blob) + metadata + object ID — and the flat-namespace
 * note dispels the "folders in a bucket" illusion.
 */
export function DsExplorer({ locale }: { locale: Locale }) {
  const t = dataStorageContent[locale].explorer;
  const [view, setView] = useState<View>('fs');
  const [openObj, setOpenObj] = useState<string | null>(null);

  const active = view === 'fs' ? t.fs : t.obj;

  return (
    <div className="not-prose">
      <DsHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* view toggle */}
        <div className="mb-5 flex justify-center">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(['fs', 'obj'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setView(opt)}
                className={cn(
                  'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
                  view === opt ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {opt === 'fs' ? t.fsTab : t.objTab}
              </button>
            ))}
          </div>
        </div>

        {/* stage */}
        <AnimatePresence mode="wait">
          {view === 'fs' ? (
            <motion.div
              key="fs"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="mb-3 flex items-center gap-2 border-b border-border pb-2.5">
                <HardDrive className="h-4 w-4 text-muted" aria-hidden />
                <span className="font-mono text-xs text-muted">{t.fs.serverLabel}</span>
              </div>
              <div className="font-mono text-xs">
                {TREE.map((node) => (
                  <FsNodeRow key={node.name} node={node} depth={0} path="" pathLabel={t.fs.pathLabel} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="obj"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted" aria-hidden />
                  <span className="font-mono text-xs text-muted">{t.obj.bucketLabel}</span>
                </div>
                <span className="text-[0.65rem] text-muted">{t.obj.tapHint}</span>
              </div>

              <div className="space-y-1.5">
                {OBJECTS.map((obj) => (
                  <ObjectRow
                    key={obj.key}
                    obj={obj}
                    open={openObj === obj.key}
                    onToggle={() => setOpenObj(openObj === obj.key ? null : obj.key)}
                    t={t.obj}
                  />
                ))}
              </div>

              <p className="mt-3 flex gap-2 rounded-lg border border-sky-500/30 bg-sky-500/[0.06] p-2.5 text-xs leading-relaxed text-fg/85">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" aria-hidden />
                {t.obj.flatNote}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* strengths / limits for the active view */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="font-mono text-[0.65rem] uppercase tracking-wide text-emerald-500">
                  {t.prosLabel}
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {active.pros.map((item) => (
                    <li key={item} className="flex gap-1.5 text-xs leading-relaxed text-fg/85">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="font-mono text-[0.65rem] uppercase tracking-wide text-amber-500">
                  {t.consLabel}
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {active.cons.map((item) => (
                    <li key={item} className="flex gap-1.5 text-xs leading-relaxed text-fg/85">
                      <Minus className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted">
              <span className="font-mono text-[0.65rem] uppercase tracking-wide">
                {t.examplesLabel}:{' '}
              </span>
              {active.examples}
            </p>

            <p className="mt-3 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
              {active.note}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FsNodeRow({
  node,
  depth,
  path,
  pathLabel,
}: {
  node: TreeNode;
  depth: number;
  path: string;
  pathLabel: string;
}) {
  const [open, setOpen] = useState(true);
  const [showPath, setShowPath] = useState(false);
  const fullPath = `${path}/${node.name}`;

  if (node.file) {
    const Icon = FILE_ICONS[node.file.kind];
    return (
      <div style={{ paddingLeft: depth * 16 }}>
        <button
          type="button"
          onClick={() => setShowPath((v) => !v)}
          className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-fg/85 transition-colors hover:bg-surface-2"
        >
          <Icon className={cn('h-3.5 w-3.5 shrink-0', FILE_TEXT[node.file.kind])} aria-hidden />
          <span className="truncate">{node.name}</span>
          <span className="ml-auto shrink-0 text-[0.65rem] text-muted">{node.file.size}</span>
        </button>
        <AnimatePresence>
          {showPath && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pl-6 text-[0.65rem] text-muted"
            >
              {pathLabel}: <span className="text-accent">{fullPath}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left font-semibold text-fg transition-colors hover:bg-surface-2"
      >
        {open ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted" aria-hidden />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted" aria-hidden />
        )}
        {open ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
        )}
        {node.name}/
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {node.children!.map((child) => (
              <FsNodeRow
                key={child.name}
                node={child}
                depth={depth + 1}
                path={fullPath}
                pathLabel={pathLabel}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ObjectRow({
  obj,
  open,
  onToggle,
  t,
}: {
  obj: BucketObject;
  open: boolean;
  onToggle: () => void;
  t: (typeof dataStorageContent)['en']['explorer']['obj'];
}) {
  const Icon = FILE_ICONS[obj.kind];
  const meta = OBJECT_META[obj.key];

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        open ? 'border-accent/40 bg-surface-2/60' : 'border-border bg-surface-2/30 hover:border-accent/30',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
      >
        <Icon className={cn('h-3.5 w-3.5 shrink-0', FILE_TEXT[obj.kind])} aria-hidden />
        <span className="truncate font-mono text-xs text-fg/85">{obj.key}</span>
        <span className="ml-auto shrink-0 font-mono text-[0.65rem] text-muted">{obj.size}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-2 border-t border-border p-3 sm:grid-cols-3">
              {/* data */}
              <div className="rounded-lg border border-violet-500/30 bg-violet-500/[0.06] p-2.5">
                <p className="font-mono text-[0.6rem] uppercase tracking-wide text-violet-500">
                  {t.dataLabel}
                </p>
                <div className="mt-1.5 flex h-6 items-end gap-0.5" aria-hidden>
                  {[5, 9, 4, 8, 6, 10, 3, 7, 5, 9, 6, 4].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h * 10}%` }}
                      className="w-1 rounded-sm bg-violet-500/60"
                    />
                  ))}
                </div>
                <p className="mt-1 text-[0.65rem] text-muted">
                  {t.dataValue} · {obj.size}
                </p>
              </div>

              {/* metadata */}
              <div className="rounded-lg border border-sky-500/30 bg-sky-500/[0.06] p-2.5">
                <p className="flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wide text-sky-500">
                  <Tags className="h-3 w-3" aria-hidden />
                  {t.metadataLabel}
                </p>
                <dl className="mt-1.5 space-y-0.5 font-mono text-[0.65rem] text-fg/80">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">content-type</dt>
                    <dd className="truncate">{obj.contentType}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">{t.createdLabel}</dt>
                    <dd>{meta.created}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">{t.customLabel}</dt>
                    <dd>{t.customValue}</dd>
                  </div>
                </dl>
              </div>

              {/* object id */}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-2.5">
                <p className="flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wide text-emerald-500">
                  <Fingerprint className="h-3 w-3" aria-hidden />
                  {t.idLabel}
                </p>
                <p className="mt-1.5 break-all font-mono text-[0.65rem] text-fg/80">{meta.id}</p>
                <p className="mt-1 text-[0.65rem] text-muted">
                  {t.keyLabel}: <span className="break-all">{obj.key}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
