import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TopicsBrowser } from '@/components/TopicsBrowser';
import { getTopicSummaries } from '@/content/topics';
import { type Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Topics' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function TopicsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations('Topics');
  const topics = await getTopicSummaries(params.locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-muted">{t('subtitle')}</p>
      </header>
      <TopicsBrowser topics={topics} locale={params.locale} />
    </div>
  );
}
