import { type Locale } from '@/i18n/routing';
import { CapTriangle } from './CapTriangle';
import { CapPartitionLab } from './CapPartitionLab';
import { CapUseCases } from './CapUseCases';

/**
 * The full interactive CAP Theorem lesson — a distributed-systems trade-off
 * simulator: explore the C/A/P triangle and the three stances, then cut the
 * network between two replicas of a bank balance, write to A, read from B,
 * and feel how AP, CP, and CA answer differently under partition. Finish by
 * calling AP-or-CP on real-world systems.
 */
export function CapLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <CapTriangle locale={locale} />
      <CapPartitionLab locale={locale} />
      <CapUseCases locale={locale} />
    </div>
  );
}
