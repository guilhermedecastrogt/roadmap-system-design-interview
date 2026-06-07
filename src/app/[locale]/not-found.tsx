'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('Topic');

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">
        {t('notFound')}
      </h1>
      <p className="mt-3 text-muted">{t('notFoundBody')}</p>
      <Link
        href="/topics"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('backToTopics')}
      </Link>
    </div>
  );
}
