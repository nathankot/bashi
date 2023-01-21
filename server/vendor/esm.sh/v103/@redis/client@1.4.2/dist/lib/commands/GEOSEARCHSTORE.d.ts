import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoSearchFrom, GeoSearchBy, GeoSearchOptions } from './generic-transformers.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './GEOSEARCH.d.ts';
interface GeoSearchStoreOptions extends GeoSearchOptions {
    STOREDIST?: true;
}
export declare function transformArguments(destination: RedisCommandArgument, source: RedisCommandArgument, from: GeoSearchFrom, by: GeoSearchBy, options?: GeoSearchStoreOptions): RedisCommandArguments;
export declare function transformReply(reply: number): number;
