'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LocaleSwitcher() {
  const t = useTranslations('Nav');
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === activeLocale) return;
    startTransition(() => {
      // Preserve the current route (incl. dynamic [slug]) across locales.
      router.replace(
        // @ts-expect-error -- params are passed through unchanged.
        { pathname, params },
        { locale: next },
      );
    });
  }

  return (
    <div
      className="inline-flex items-center rounded-md border border-border p-0.5"
      role="group"
      aria-label={t('language')}
    >
      <Languages className="ml-1.5 mr-1 h-4 w-4 text-muted" aria-hidden />
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={isPending}
          aria-current={loc === activeLocale ? 'true' : undefined}
          onClick={() => switchTo(loc)}
          className={cn(
            'rounded px-2 py-1 text-xs font-medium transition-colors',
            loc === activeLocale
              ? 'bg-surface-2 text-fg'
              : 'text-muted hover:text-fg',
          )}
          title={localeNames[loc]}
        >
          {loc === 'pt-BR' ? 'PT' : 'EN'}
        </button>
      ))}
    </div>
  );
}
