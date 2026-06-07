/**
 * Validates every topic's frontmatter against the zod schema and checks a few
 * repo conventions. Run with `npm run validate:content`.
 *
 * Standalone on purpose: it imports only the schema (no Next.js / next-intl),
 * so contributors can validate content without booting the app.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { topicFrontmatterSchema } from '../src/content/schema';

const LOCALES = ['en', 'pt-BR'] as const;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOPICS_DIR = path.join(ROOT, 'src', 'content', 'topics');

type Issue = { file: string; message: string };

async function main() {
  const issues: Issue[] = [];
  const warnings: Issue[] = [];

  const entries = await fs.readdir(TOPICS_DIR, { withFileTypes: true });
  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  if (slugs.length === 0) {
    console.error('No topics found in src/content/topics.');
    process.exit(1);
  }

  for (const slug of slugs) {
    const present: string[] = [];

    for (const locale of LOCALES) {
      const rel = path.join('src/content/topics', slug, `${locale}.md`);
      const abs = path.join(TOPICS_DIR, slug, `${locale}.md`);

      let raw: string;
      try {
        raw = await fs.readFile(abs, 'utf8');
      } catch {
        continue; // missing translation handled below
      }
      present.push(locale);

      const { data } = matter(raw);
      const parsed = topicFrontmatterSchema.safeParse(data);

      if (!parsed.success) {
        for (const err of parsed.error.errors) {
          issues.push({
            file: rel,
            message: `${err.path.join('.') || '(root)'}: ${err.message}`,
          });
        }
        continue;
      }

      if (parsed.data.slug !== slug) {
        issues.push({
          file: rel,
          message: `slug "${parsed.data.slug}" does not match folder "${slug}"`,
        });
      }
    }

    if (present.length === 0) {
      issues.push({ file: slug, message: 'topic folder has no .md files' });
    } else {
      const missing = LOCALES.filter((l) => !present.includes(l));
      for (const locale of missing) {
        warnings.push({
          file: `${slug}/${locale}.md`,
          message: 'translation missing (falls back to default locale)',
        });
      }
    }
  }

  for (const w of warnings) {
    console.warn(`  warn  ${w.file} — ${w.message}`);
  }

  if (issues.length > 0) {
    console.error(`\n✖ ${issues.length} content error(s):\n`);
    for (const i of issues) {
      console.error(`  error  ${i.file} — ${i.message}`);
    }
    process.exit(1);
  }

  console.log(
    `\n✓ ${slugs.length} topics validated across ${LOCALES.length} locales` +
      (warnings.length ? ` (${warnings.length} translation warning(s))` : '') +
      '.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
