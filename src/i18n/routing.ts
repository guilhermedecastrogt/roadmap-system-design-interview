import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'pt-BR'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (BR)',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix the locale so /en and /pt-BR are explicit and shareable.
  localePrefix: 'always',
});
