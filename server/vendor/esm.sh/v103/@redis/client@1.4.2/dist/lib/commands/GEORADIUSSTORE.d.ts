import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoCoordinates, GeoUnits, GeoRadiusStoreOptions } from './generic-transformers.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './GEORADIUS.d.ts';
export declare function transformArguments(key: RedisCommandArgument, coordinates: GeoCoordinates, radius: number, unit: GeoUnits, destination: RedisCommandArgument, options?: GeoRadiusStoreOptions): RedisCommandArguments;
export declare function transformReply(): number;
