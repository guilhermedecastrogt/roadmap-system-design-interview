'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, CodeSurface } from '../api-track/ApiKit';
import { WIRE_FIELDS, grpcContent, type WireFieldId } from './content';

const ALL: WireFieldId[] = ['id', 'name', 'email', 'active'];

/**
 * Where the payload size actually comes from: protobuf puts a field *number* on
 * the wire instead of a name, and encodes values in binary. The same fact
 * explains the schema rules below — numbers are the contract, names are not.
 */
export function GrpcWireLab({ locale }: { locale: Locale }) {
  const t = grpcContent[locale].wire;
  const [selected, setSelected] = useState<WireFieldId[]>(ALL);

  const fields = WIRE_FIELDS.filter((f) => selected.includes(f.id));
  const json = `{ ${fields.map((f) => `"${f.json}": ${f.value}`).join(', ')} }`;
  const jsonBytes = json.length;
  const protoBytes = fields.reduce((sum, f) => sum + f.protoBytes, 0);
  const saving = jsonBytes > 0 ? Math.round((1 - protoBytes / jsonBytes) * 100) : 0;
  const max = Math.max(jsonBytes, protoBytes, 1);

  const protoView =
    fields
      .map((f) => `field ${f.tag}  (${f.type})  ${String(f.protoBytes).padStart(2)} bytes  ← "${f.json}" is not sent`)
      .join('\n') || '—';

  function toggle(id: WireFieldId) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        {/* field toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
            {t.fieldsLabel}
          </span>
          {WIRE_FIELDS.map((f) => {
            const on = selected.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                className={cn(
                  'rounded-lg border px-2 py-1 font-mono text-[0.7rem] transition-colors',
                  on
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted hover:text-fg',
                )}
              >
                {f.json} <span className="opacity-60">= {f.tag}</span>
              </button>
            );
          })}
        </div>

        {/* size comparison */}
        <div className="mt-4 space-y-2.5">
          <SizeBar
            label={t.jsonLabel}
            bytes={jsonBytes}
            max={max}
            unit={t.bytesLabel}
            tone="amber"
          />
          <SizeBar
            label={t.protoLabel}
            bytes={protoBytes}
            max={max}
            unit={t.bytesLabel}
            tone="emerald"
            badge={jsonBytes > protoBytes ? `${saving}% ${t.savingLabel}` : undefined}
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <CodeSurface title={t.jsonLabel} body={json || '{}'} tone="amber" />
          <CodeSurface title={t.protoLabel} body={protoView} tone="emerald" />
        </div>

        <p className="mt-2 text-center text-xs text-muted">{t.tagHint}</p>

        {/* schema evolution */}
        <div className="mt-5 border-t border-border pt-4">
          <h4 className="font-display text-base font-semibold text-fg">{t.evolutionTitle}</h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {t.evolution.map((rule, i) => {
              const safe = rule.verdict === 'safe';
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.28, delay: i * 0.05 }}
                  className={cn(
                    'rounded-xl border p-3',
                    safe
                      ? 'border-emerald-500/40 bg-emerald-500/[0.05]'
                      : 'border-rose-500/40 bg-rose-500/[0.05]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {safe ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500" aria-hidden />
                    )}
                    <span className="text-[0.82rem] font-semibold text-fg">{rule.label}</span>
                    <span
                      className={cn(
                        'ml-auto rounded px-1.5 py-0.5 font-mono text-[0.55rem] font-bold uppercase',
                        safe ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500',
                      )}
                    >
                      {safe ? t.safeLabel : t.dangerLabel}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.76rem] leading-relaxed text-fg/85">{rule.what}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}

function SizeBar({
  label,
  bytes,
  max,
  unit,
  tone,
  badge,
}: {
  label: string;
  bytes: number;
  max: number;
  unit: string;
  tone: 'amber' | 'emerald';
  badge?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">{label}</span>
        <span
          className={cn(
            'font-display text-sm font-bold',
            tone === 'amber' ? 'text-amber-500' : 'text-emerald-500',
          )}
        >
          {bytes} {unit}
        </span>
        {badge && (
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[0.6rem] font-bold text-emerald-500">
            {badge}
          </span>
        )}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className={cn('h-full rounded-full', tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500')}
          animate={{ width: `${(bytes / max) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
