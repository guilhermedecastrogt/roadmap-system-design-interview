import { type Locale } from '@/i18n/routing';
import { ApiCommunicationMap } from '../api-track/ApiCommunicationMap';
import { ApiStyleCompare } from '../api-track/ApiStyleCompare';
import { ApiTrackNav } from '../api-track/ApiTrackNav';
import { GrpcContractLab } from './GrpcContractLab';
import { GrpcStreamingModes } from './GrpcStreamingModes';
import { GrpcWireLab } from './GrpcWireLab';
import { GrpcWhereItFits } from './GrpcWhereItFits';

/**
 * The gRPC lesson — the last stop of the API communication track, and the one
 * about traffic the public never sees: one .proto generating both sides, four
 * streaming shapes on a single HTTP/2 connection, why the payload is so small
 * (and so unreadable), and where gRPC belongs relative to REST at the edge.
 */
export function GrpcLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <GrpcContractLab locale={locale} />
      <GrpcStreamingModes locale={locale} />
      <GrpcWireLab locale={locale} />
      <GrpcWhereItFits locale={locale} />
      <ApiCommunicationMap locale={locale} current="grpc" />
      <ApiStyleCompare locale={locale} />
      <ApiTrackNav locale={locale} current="grpc" />
    </div>
  );
}
