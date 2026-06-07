import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { type Difficulty, type Status } from '@/content/schema';

const difficultyStyles: Record<Difficulty, string> = {
  beginner:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
  intermediate:
    'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20',
  advanced:
    'bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20',
};

const statusStyles: Record<Status, string> = {
  planned: 'bg-surface-2 text-muted ring-border',
  'in-progress':
    'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/20',
  published:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
};

const baseChip =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset';

export function DifficultyBadge({ value }: { value: Difficulty }) {
  const t = useTranslations('Difficulty');
  return <span className={cn(baseChip, difficultyStyles[value])}>{t(value)}</span>;
}

export function StatusBadge({ value }: { value: Status }) {
  const t = useTranslations('Status');
  return (
    <span className={cn(baseChip, statusStyles[value])}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          value === 'published'
            ? 'bg-emerald-500'
            : value === 'in-progress'
              ? 'bg-sky-500'
              : 'bg-muted',
        )}
        aria-hidden
      />
      {t(value)}
    </span>
  );
}
