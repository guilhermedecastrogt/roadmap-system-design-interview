import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { GITHUB_URL } from '@/lib/site';

export function Footer() {
  const t = useTranslations('Footer');
  const nav = useTranslations('Nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-fg">{t('tagline')}</p>
          <p className="text-sm text-muted">{t('builtWith')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link href="/topics" className="text-muted hover:text-fg">
            {nav('topics')}
          </Link>
          <Link href="/about" className="text-muted hover:text-fg">
            {nav('about')}
          </Link>
          <Link href="/contributing" className="text-muted hover:text-fg">
            {nav('contributing')}
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-muted hover:text-fg"
          >
            {nav('github')}
          </a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted sm:px-6">
          © {year} · {t('license')} · {t('rights')}
        </div>
      </div>
    </footer>
  );
}
