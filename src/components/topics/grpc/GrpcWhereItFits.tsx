'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Globe, MonitorSmartphone, Server, TowerControl, TriangleAlert } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';
import { ApiHeading, ApiNote, ApiPanel } from '../api-track/ApiKit';
import { grpcContent } from './content';

/** Renders `[label](/href)` inside a plain content string as a real link. */
function withLinks(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const href = match[2].replace(/^\/(en|pt-BR)/, '');
    parts.push(
      <Link key={match.index} href={href} className="font-medium text-accent hover:underline">
        {match[1]}
      </Link>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * The placement question, answered with a picture: HTTP/JSON at the edge where
 * anything can call you, gRPC behind it where the callers are your own
 * services. The browser limitation gets its own callout because it is the first
 * thing that surprises people.
 */
export function GrpcWhereItFits({ locale }: { locale: Locale }) {
  const t = grpcContent[locale].fit;

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        {/* edge vs inside */}
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1.2fr] lg:items-stretch">
          <Zone
            title={t.edgeTitle}
            text={t.edgeText}
            protocol="HTTP/1.1 · JSON"
            tone="sky"
            icons={[MonitorSmartphone, Globe]}
          />

          <div className="flex items-center justify-center lg:flex-col">
            <div className="flex flex-col items-center gap-1.5">
              <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-accent bg-surface text-accent">
                <TowerControl className="h-5 w-5" aria-hidden />
              </div>
              <span className="font-mono text-[0.6rem] text-muted">gateway</span>
            </div>
          </div>

          <Zone
            title={t.insideTitle}
            text={t.insideText}
            protocol="HTTP/2 · protobuf"
            tone="emerald"
            icons={[Server, Server, Server]}
          />
        </div>

        {/* browser limitation */}
        <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/[0.06] p-3.5">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500">
            <TriangleAlert className="h-4 w-4" aria-hidden />
            {t.browserTitle}
          </p>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-fg/85">
            {withLinks(t.browserText)}
          </p>
        </div>

        {/* good / costs */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <List title={t.goodTitle} items={t.good} tone="emerald" />
          <List title={t.costTitle} items={t.costs} tone="amber" />
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}

function Zone({
  title,
  text,
  protocol,
  tone,
  icons,
}: {
  title: string;
  text: string;
  protocol: string;
  tone: 'sky' | 'emerald';
  icons: typeof Server[];
}) {
  const color = tone === 'sky' ? 'text-sky-500' : 'text-emerald-500';
  const border = tone === 'sky' ? 'border-sky-500/40' : 'border-emerald-500/40';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border ${border} bg-surface p-3.5`}
    >
      <div className="flex items-center gap-2">
        {icons.map((Icon, i) => (
          <Icon key={i} className={`h-4 w-4 ${color}`} aria-hidden />
        ))}
        <span className="text-sm font-semibold text-fg">{title}</span>
      </div>
      <code className={`mt-2 block w-fit rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.62rem] ${color}`}>
        {protocol}
      </code>
      <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">{text}</p>
    </motion.div>
  );
}

function List({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'emerald' | 'amber';
}) {
  const color = tone === 'emerald' ? 'text-emerald-500' : 'text-amber-500';
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <p className={`text-sm font-semibold ${color}`}>{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[0.78rem] leading-relaxed text-fg/85">
            {tone === 'emerald' ? (
              <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${color}`} aria-hidden />
            ) : (
              <TriangleAlert className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${color}`} aria-hidden />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
