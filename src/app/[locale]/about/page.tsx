import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Markdown } from '@/components/Markdown';
import { getPage } from '@/content/pages';
import { type Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'About' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function AboutPage({
  params,
}: {
  params: { locale: Locale };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations('About');
  const body = await getPage('about', params.locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-lg text-muted">{t('subtitle')}</p>
      </header>
      {body && <Markdown content={body} />}
    </div>
  );
}
