'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, RefreshCw, ShieldCheck } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, MethodChip } from '../api-track/ApiKit';
import { restContent, type ResourceId } from './content';

/**
 * The resource/endpoint map. Two columns matter more than the paths: whether a
 * method is *safe* (changes nothing) and whether it is *idempotent* (a retry
 * lands in the same state). Those two promises are why clients can retry at all.
 */
export function RestResourceMap({ locale }: { locale: Locale }) {
  const t = restContent[locale].resources;
  const s = restContent[locale].shared;
  const [resourceId, setResourceId] = useState<ResourceId>('tweets');
  const resource = t.resources.find((r) => r.id === resourceId)!;

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
              {t.resourceLabel}
            </span>
            <div className="flex gap-1.5">
              {t.resources.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setResourceId(r.id)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                    r.id === resourceId
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:text-fg',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <span className="rounded-md border border-border bg-surface px-2 py-1 font-mono text-[0.7rem] text-muted">
            {resource.noun}
          </span>
        </div>

        {/* header */}
        <div className="hidden grid-cols-[13rem_1fr_5rem_6.5rem] items-center gap-2 border-b border-border pb-2 sm:grid">
          <span />
          <span />
          <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-wide text-muted">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            {t.safeLabel}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-wide text-muted">
            <RefreshCw className="h-3 w-3" aria-hidden />
            {t.idempotentLabel}
          </span>
        </div>

        <ul className="divide-y divide-border">
          {resource.rows.map((row, i) => (
            <motion.li
              key={`${row.method}-${row.path}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.03 }}
              className="grid items-center gap-1.5 py-2.5 sm:grid-cols-[13rem_1fr_5rem_6.5rem] sm:gap-2"
            >
              <MethodChip method={row.method} path={row.path} className="w-fit" />
              <span className="text-[0.78rem] text-fg/85">{row.what}</span>
              <Flag on={row.safe} yes={s.yes} no={s.no} label={t.safeLabel} />
              <Flag on={row.idempotent} yes={s.yes} no={s.no} label={t.idempotentLabel} />
            </motion.li>
          ))}
        </ul>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <p className="rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
            <span className="font-semibold text-fg">{t.safeLabel} · </span>
            {t.safeHelp}
          </p>
          <p className="rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
            <span className="font-semibold text-fg">{t.idempotentLabel} · </span>
            {t.idempotentHelp}
          </p>
        </div>

        {/* PUT vs PATCH */}
        <div className="mt-3 rounded-xl border border-accent/30 bg-accent/[0.05] p-3.5">
          <p className="text-sm font-semibold text-accent">{t.putPatchTitle}</p>
          <ul className="mt-2 space-y-1.5">
            {t.putPatch.map((line) => (
              <li key={line} className="flex gap-2 text-[0.8rem] leading-relaxed text-fg/85">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}

function Flag({
  on,
  yes,
  no,
  label,
}: {
  on: boolean;
  yes: string;
  no: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.68rem] font-semibold',
        on ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-2 text-muted',
      )}
    >
      {on ? (
        <Check className="h-3 w-3" aria-hidden />
      ) : (
        <Minus className="h-3 w-3" aria-hidden />
      )}
      <span className="sm:hidden">{label}: </span>
      {on ? yes : no}
    </span>
  );
}
