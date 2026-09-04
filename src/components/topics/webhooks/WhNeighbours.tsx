'use client';

import { motion } from 'framer-motion';
import { ArrowLeftRight, Layers, Webhook } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { ApiHeading, ApiNote, ApiPanel, FactRow, toneText, type Tone } from '../api-track/ApiKit';
import { webhooksContent } from './content';

const META: Record<string, { icon: typeof Webhook; tone: Tone }> = {
  api: { icon: ArrowLeftRight, tone: 'sky' },
  webhook: { icon: Webhook, tone: 'amber' },
  queue: { icon: Layers, tone: 'violet' },
};

/**
 * Webhooks vs request/response APIs vs message queues. Three things that all
 * "move messages", solving different problems — worth separating out loud.
 */
export function WhNeighbours({ locale }: { locale: Locale }) {
  const t = webhooksContent[locale].neighbours;

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="grid gap-3 sm:grid-cols-3">
          {t.items.map((item, i) => {
            const { icon: Icon, tone } = META[item.id];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className="rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-accent/40"
              >
                <div className="mb-2.5 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${toneText[tone]}`} aria-hidden />
                  <span className="text-sm font-semibold text-fg">{item.label}</span>
                </div>
                <dl className="space-y-2">
                  <FactRow label={t.whatLabel} value={item.what} />
                  <FactRow label={t.whenLabel} value={item.when} />
                </dl>
              </motion.div>
            );
          })}
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
