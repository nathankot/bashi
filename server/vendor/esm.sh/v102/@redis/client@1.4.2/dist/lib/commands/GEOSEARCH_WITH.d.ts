import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoSearchFrom, GeoSearchBy, GeoReplyWith, GeoSearchOptions } from './generic-transformers.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './GEOSEARCH.d.ts';
export declare function transformArguments(key: RedisCommandArgument, from: GeoSearchFrom, by: GeoSearchBy, replyWith: Array<GeoReplyWith>, options?: GeoSearchOptions): RedisCommandArguments;
export { transformGeoMembersWithReply as transformReply } from './generic-transformers.d.ts';
