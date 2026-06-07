import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { type Locale, defaultLocale } from '@/i18n/routing';

const PAGES_DIR = path.join(process.cwd(), 'src', 'content', 'pages');

/**
 * Load a static page's Markdown body for a locale, falling back to the
 * default locale. Used for About and Contributing so their prose lives in
 * editable Markdown rather than buried in components.
 */
export async function getPage(
  name: string,
  locale: Locale,
): Promise<string | null> {
  for (const candidate of [locale, defaultLocale]) {
    try {
      return await fs.readFile(
        path.join(PAGES_DIR, name, `${candidate}.md`),
        'utf8',
      );
    } catch {
      continue;
    }
  }
  return null;
}
