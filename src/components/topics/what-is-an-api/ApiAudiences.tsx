'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Globe2, Handshake, Smartphone } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, FactRow, toneBg, toneBorder, toneText, type Tone } from '../api-track/ApiKit';
import { apiOverviewContent, type AudienceId } from './content';

const META: Record<AudienceId, { icon: typeof Globe2; tone: Tone }> = {
  public: { icon: Globe2, tone: 'sky' },
  partner: { icon: Handshake, tone: 'amber' },
  internal: { icon: Building2, tone: 'violet' },
  private: { icon: Smartphone, tone: 'emerald' },
};

/**
 * Same technology, four audiences. Who is allowed to call an API changes how
 * much freedom you keep to change it — the point beginners most often miss.
 */
export function ApiAudiences({ locale }: { locale: Locale }) {
  const t = apiOverviewContent[locale].audiences;
  const [selected, setSelected] = useState<AudienceId>('public');
  const item = t.items.find((i) => i.id === selected)!;
  const tone = META[selected].tone;

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="grid gap-2 sm:grid-cols-4">
          {t.items.map((i) => {
            const { icon: Icon, tone: itemTone } = META[i.id];
            const on = i.id === selected;
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => setSelected(i.id)}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all',
                  on
                    ? cn(toneBorder[itemTone], toneBg[itemTone], 'shadow-sm')
                    : 'border-border hover:border-accent/40',
                )}
              >
                <Icon
                  className={cn('h-4 w-4', on ? toneText[itemTone] : 'text-muted')}
                  aria-hidden
                />
                <span className={cn('text-sm font-semibold', on ? toneText[itemTone] : 'text-fg')}>
                  {i.label}
                </span>
                <span className="text-[0.68rem] leading-snug text-muted">{i.who}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.dl
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-2.5 rounded-xl border border-border bg-surface p-3.5"
          >
            <FactRow label={t.exampleLabel} value={item.example} />
            <FactRow label={t.accessLabel} value={item.access} />
            <FactRow
              label={t.watchLabel}
              value={<span className={toneText[tone]}>{item.watch}</span>}
            />
          </motion.dl>
        </AnimatePresence>

        <p className="mt-3 text-center text-xs text-muted">{t.tapHint}</p>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
