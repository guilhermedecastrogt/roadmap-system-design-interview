'use client';

import { motion } from 'framer-motion';
import { Boxes, Database, Globe, Scale, Users } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { lbContent } from './content';

export function LbArchitecture({ locale }: { locale: Locale }) {
  const c = lbContent[locale].arch;

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 flex flex-col items-center gap-0 rounded-2xl border border-border bg-surface/40 p-6">
        <Tier>
          <Chip icon={Users} label={c.clients} />
        </Tier>

        <LbConnector label={c.lb} note={c.notes.edge} />

        <Tier>
          {[0, 1, 2].map((i) => (
            <Chip key={i} icon={Globe} label={`${c.web} ${i + 1}`} />
          ))}
        </Tier>

        <LbConnector label={c.lb} note={c.notes.service} />

        <Tier>
          {[0, 1, 2].map((i) => (
            <Chip key={i} icon={Boxes} label={`${c.services} ${i + 1}`} />
          ))}
        </Tier>

        <LbConnector label={c.lb} note={c.notes.data} />

        <Tier>
          <Chip icon={Database} label={`${c.db} · ${c.dbPrimary}`} accent />
          <Chip icon={Database} label={`${c.db} · ${c.dbReplica}`} />
          <Chip icon={Database} label={`${c.db} · ${c.dbReplica}`} />
        </Tier>

        <p className="mt-5 text-center text-sm text-fg/80">{c.caption}</p>
      </div>
    </div>
  );
}

function Tier({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-2.5">{children}</div>;
}

function Chip({
  icon: Icon,
  label,
  accent,
}: {
  icon: typeof Users;
  label: string;
  accent?: boolean;
}) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ' +
        (accent
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-border bg-surface text-fg')
      }
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}

function LbConnector({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex w-full flex-col items-center">
      <span className="h-4 w-px bg-border" aria-hidden />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent shadow-sm shadow-accent/10">
          <Scale className="h-3.5 w-3.5" aria-hidden />
          {label}
        </span>
        <span className="max-w-xs text-center text-xs text-muted sm:text-left">{note}</span>
      </motion.div>
      <span className="h-4 w-px bg-border" aria-hidden />
    </div>
  );
}
