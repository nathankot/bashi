import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoUnits, GeoRadiusStoreOptions } from './generic-transformers.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './GEORADIUSBYMEMBER.d.ts';
export declare function transformArguments(key: RedisCommandArgument, member: string, radius: number, unit: GeoUnits, destination: RedisCommandArgument, options?: GeoRadiusStoreOptions): RedisCommandArguments;
export declare function transformReply(): number;
