import { Children, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugifyHeading } from '@/lib/utils';

/** Flatten React children into plain text (for heading anchor ids). */
function toText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }
      if (child && typeof child === 'object' && 'props' in child) {
        return toText((child as { props: { children?: ReactNode } }).props.children);
      }
      return '';
    })
    .join('');
}

/**
 * Renders a topic's Markdown body. Section headings (## / ###) get stable ids
 * so the table of contents can link to them. Styling lives in `.prose-content`.
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 id={slugifyHeading(toText(children))}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 id={slugifyHeading(toText(children))}>{children}</h3>
          ),
          a: ({ href, children }) => {
            const external = href?.startsWith('http');
            return (
              <a
                href={href}
                {...(external
                  ? { target: '_blank', rel: 'noreferrer noopener' }
                  : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** Extract `## ` headings from a Markdown body for the table of contents. */
export function extractHeadings(content: string): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      const text = match[1].replace(/[*_`]/g, '').trim();
      headings.push({ id: slugifyHeading(text), text });
    }
  }
  return headings;
}
