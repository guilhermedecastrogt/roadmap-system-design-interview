import { type Locale } from '@/i18n/routing';
import { GwControlTower } from './GwControlTower';
import { GwBeforeAfter } from './GwBeforeAfter';
import { GwResponsibilities } from './GwResponsibilities';
import { GwRoutingDemo } from './GwRoutingDemo';
import { GwProtocolTranslation } from './GwProtocolTranslation';

/**
 * The full interactive API Gateway lesson — an "API control tower": send a
 * request and watch it clear (or fail) each policy checkpoint inside the
 * gateway, toggle the architecture with and without a gateway, explore every
 * responsibility the gateway can centralize, dispatch requests through the
 * routing table, and watch HTTP/JSON get translated to gRPC on the way in.
 */
export function GwLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <GwControlTower locale={locale} />
      <GwBeforeAfter locale={locale} />
      <GwResponsibilities locale={locale} />
      <GwRoutingDemo locale={locale} />
      <GwProtocolTranslation locale={locale} />
    </div>
  );
}
