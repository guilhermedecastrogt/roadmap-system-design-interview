'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, toneBg, toneText, type Tone } from '../api-track/ApiKit';
import {
  anatomyRequestLines,
  anatomyResponseLines,
  apiOverviewContent,
  type PartId,
} from './content';

const PART_TONE: Record<PartId, Tone> = {
  method: 'sky',
  endpoint: 'accent',
  headers: 'violet',
  body: 'emerald',
  status: 'amber',
  resHeaders: 'violet',
  resBody: 'emerald',
};

/**
 * The anatomy inspector: the same request and response as plain text, with
 * every part clickable. Reading a raw HTTP exchange once — and knowing which
 * piece is which — is most of what "understanding APIs" means at this level.
 */
export function ApiAnatomy({ locale }: { locale: Locale }) {
  const t = apiOverviewContent[locale].anatomy;
  const [selected, setSelected] = useState<PartId>('method');

  const part = t.parts.find((p) => p.id === selected)!;
  const requestParts = t.parts.filter((p) => p.side === 'request');
  const responseParts = t.parts.filter((p) => p.side === 'response');

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="grid gap-3 lg:grid-cols-2">
          <Pane
            title={t.requestTitle}
            icon="up"
            lines={anatomyRequestLines}
            selected={selected}
            onSelect={setSelected}
          />
          <Pane
            title={t.responseTitle}
            icon="down"
            lines={anatomyResponseLines}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* part chips */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[requestParts, responseParts].map((group, gi) => (
            <div key={gi} className="flex flex-wrap gap-1.5">
              {group.map((p) => {
                const on = p.id === selected;
                const tone = PART_TONE[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p.id)}
                    className={cn(
                      'rounded-lg border px-2 py-1 text-[0.7rem] font-medium transition-colors',
                      on
                        ? cn('border-current', toneBg[tone], toneText[tone])
                        : 'border-border text-muted hover:text-fg',
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={part.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'mt-3 rounded-xl border bg-surface p-3.5',
              'border-border',
            )}
          >
            <div className={cn('text-sm font-semibold', toneText[PART_TONE[part.id]])}>
              {part.label}
            </div>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-fg/85">{part.what}</p>
          </motion.div>
        </AnimatePresence>

        <p className="mt-3 text-center text-xs text-muted">{t.tapHint}</p>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}

function Pane({
  title,
  icon,
  lines,
  selected,
  onSelect,
}: {
  title: string;
  icon: 'up' | 'down';
  lines: { part: PartId; text: string }[];
  selected: PartId;
  onSelect: (id: PartId) => void;
}) {
  const Icon = icon === 'up' ? ArrowUpRight : ArrowDownLeft;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-2/60 px-3 py-1.5">
        <Icon className="h-3 w-3 text-muted" aria-hidden />
        <span className="font-mono text-[0.65rem] uppercase tracking-wide text-muted">{title}</span>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[0.72rem] leading-6">
        {lines.map((line, i) => {
          const on = line.part === selected;
          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(line.part)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(line.part);
                }
              }}
              className={cn(
                'cursor-pointer rounded-sm transition-colors',
                on
                  ? cn(toneBg[PART_TONE[line.part]], toneText[PART_TONE[line.part]], 'font-semibold')
                  : 'text-fg/60 hover:text-fg',
              )}
            >
              {line.text}
            </span>
          );
        })}
      </pre>
    </div>
  );
}
