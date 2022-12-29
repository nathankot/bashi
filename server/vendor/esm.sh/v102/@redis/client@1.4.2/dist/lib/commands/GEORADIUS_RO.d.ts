import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoSearchOptions, GeoCoordinates, GeoUnits } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key: RedisCommandArgument, coordinates: GeoCoordinates, radius: number, unit: GeoUnits, options?: GeoSearchOptions): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
