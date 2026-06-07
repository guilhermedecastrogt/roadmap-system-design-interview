/**
 * Central place for project-wide constants. Update the GitHub URL once the
 * repository is published; "edit this page" and footer links read from here.
 */
export const GITHUB_URL = 'https://github.com/your-org/system-design-interview-roadmap';

/** Build the "edit this page" link for a topic file on GitHub. */
export function editTopicUrl(slug: string, locale: string): string {
  return `${GITHUB_URL}/edit/main/src/content/topics/${slug}/${locale}.md`;
}
