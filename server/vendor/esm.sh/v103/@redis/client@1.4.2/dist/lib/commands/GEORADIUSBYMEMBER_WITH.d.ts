import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoReplyWith, GeoSearchOptions, GeoUnits } from './generic-transformers.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './GEORADIUSBYMEMBER.d.ts';
export declare function transformArguments(key: RedisCommandArgument, member: string, radius: number, unit: GeoUnits, replyWith: Array<GeoReplyWith>, options?: GeoSearchOptions): RedisCommandArguments;
export { transformGeoMembersWithReply as transformReply } from './generic-transformers.d.ts';
