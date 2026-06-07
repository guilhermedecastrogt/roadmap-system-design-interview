import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  Boxes,
  Compass,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Roadmap } from '@/components/Roadmap';
import { BlueprintBackdrop } from '@/components/BlueprintBackdrop';
import { SchemaCard } from '@/components/SchemaCard';
import { BuildingBlocksMarquee } from '@/components/BuildingBlocksMarquee';
import { getRoadmap } from '@/content/topics';
import { stages } from '@/content/stages';
import { locales, type Locale } from '@/i18n/routing';

export default async function HomePage({
  params,
}: {
  params: { locale: Locale };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations('Home');
  const roadmap = await getRoadmap(params.locale);

  const topicCount = roadmap.reduce((n, s) => n + s.topics.length, 0);
  const blocks =
    roadmap.find((s) => s.id === 'blocos-fundamentais')?.topics.map((x) => x.title) ??
    [];

  const stats = [
    { value: topicCount, label: t('statsTopics') },
    { value: stages.length, label: t('statsStages') },
    { value: locales.length, label: t('statsLanguages') },
  ];

  const intro = [
    { icon: Boxes, title: t('whatTitle'), body: t('whatBody') },
    { icon: Users, title: t('whoTitle'), body: t('whoBody') },
    { icon: RefreshCw, title: t('howTitle'), body: t('howBody') },
  ];

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <BlueprintBackdrop />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-24">
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 font-mono text-xs text-muted backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {t('eyebrow')}
            </span>

            <h1 className="animate-fade-up delay-1 mt-6 text-balance font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-fg sm:text-6xl">
              {t.rich('title', {
                hl: (chunks) => <span className="text-gradient">{chunks}</span>,
              })}
            </h1>

            <p className="animate-fade-up delay-2 mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
              {t('subtitle')}
            </p>

            <div className="animate-fade-up delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/topics"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-fg shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40"
              >
                {t('ctaPrimary')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-5 py-3 text-sm font-semibold text-fg backdrop-blur transition hover:border-accent/40 hover:bg-surface-2"
              >
                {t('ctaSecondary')}
              </Link>
            </div>

            <dl className="animate-fade-up delay-4 mt-12 flex flex-wrap gap-x-10 gap-y-5">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl font-bold tabular-nums text-fg">
                    {s.value}
                  </dt>
                  <dd className="mt-0.5 font-mono text-xs uppercase tracking-wider text-muted">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up delay-3">
            <SchemaCard caption={t('schemaCaption')} />
          </div>
        </div>

        <BuildingBlocksMarquee label={t('learnLabel')} items={blocks} />
      </section>

      {/* ──────────────────────── Intro / About ──────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <SectionEyebrow icon={Sparkles} index="01">
          {t('introEyebrow')}
        </SectionEyebrow>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <h2 className="max-w-md text-balance font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            {t('introTitle')}
          </h2>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted">
            {t('introLead')}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {intro.map((card, i) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-black/5"
            >
              <span className="absolute right-5 top-5 font-mono text-xs text-border transition-colors group-hover:text-accent/60">
                0{i + 1}
              </span>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/20 transition group-hover:bg-accent/15">
                <card.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{card.body}</p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Roadmap ───────────────────────── */}
      <section
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
        aria-labelledby="roadmap-heading"
      >
        <SectionEyebrow icon={Compass} index="02">
          {t('roadmapEyebrow')}
        </SectionEyebrow>
        <div className="mb-12 mt-4 max-w-2xl">
          <h2
            id="roadmap-heading"
            className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl"
          >
            {t('roadmapTitle')}
          </h2>
          <p className="mt-3 text-lg text-muted">{t('roadmapSubtitle')}</p>
        </div>
        <Roadmap roadmap={roadmap} locale={params.locale} />
      </section>

      {/* ───────────────────────── CTA band ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="aurora animate-glow-pulse left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 opacity-40"
            style={{
              background:
                'radial-gradient(circle at center, rgb(var(--accent) / 0.4), transparent 65%)',
            }}
          />
          <div className="bg-blueprint absolute inset-0 -z-10 opacity-60" aria-hidden />
          <h2 className="mx-auto max-w-xl text-balance font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            {t('ctaTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-muted">{t('ctaBody')}</p>
          <Link
            href="/topics"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40"
          >
            {t('ctaButton')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionEyebrow({
  icon: Icon,
  index,
  children,
}: {
  icon: typeof Compass;
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
        <Icon className="h-4 w-4" aria-hidden />
        {index}
      </span>
      <span className="h-px w-8 bg-border" aria-hidden />
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        {children}
      </span>
    </div>
  );
}
