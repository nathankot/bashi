import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoSearchFrom, GeoSearchBy, GeoSearchOptions } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key: RedisCommandArgument, from: GeoSearchFrom, by: GeoSearchBy, options?: GeoSearchOptions): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
