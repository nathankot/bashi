import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoReplyWith, GeoSearchOptions, GeoCoordinates, GeoUnits } from './generic-transformers.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './GEORADIUS.d.ts';
export declare function transformArguments(key: RedisCommandArgument, coordinates: GeoCoordinates, radius: number, unit: GeoUnits, replyWith: Array<GeoReplyWith>, options?: GeoSearchOptions): RedisCommandArguments;
export { transformGeoMembersWithReply as transformReply } from './generic-transformers.d.ts';
