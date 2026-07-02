'use client';

import { motion } from 'framer-motion';
import { Fingerprint, Globe, KeyRound, Layers, Mail, Route } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { rateLimitContent } from './content';

const ICONS: Record<string, typeof Globe> = {
  ip: Globe,
  user: Fingerprint,
  email: Mail,
  endpoint: Route,
  apikey: KeyRound,
  combo: Layers,
};

export function RlDimensions({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const d = c.dimensions;

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{d.title}</h3>
      <p className="mt-1 max-w-3xl text-sm text-muted">{d.subtitle}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {d.cards.map((card, i) => {
          const Icon = ICONS[card.id] ?? Globe;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-border text-accent transition-colors group-hover:border-accent/50">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-semibold text-fg">{card.label}</div>
                  <code className="font-mono text-[0.7rem] text-muted">{card.example}</code>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">{card.note}</p>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg border border-accent/30 bg-accent/[0.06] p-3 text-xs leading-relaxed text-fg/90">
        {d.combo}
      </p>
    </div>
  );
}
