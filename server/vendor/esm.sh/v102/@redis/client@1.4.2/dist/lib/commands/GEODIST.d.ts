import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { GeoUnits } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key: RedisCommandArgument, member1: RedisCommandArgument, member2: RedisCommandArgument, unit?: GeoUnits): RedisCommandArguments;
export declare function transformReply(reply: RedisCommandArgument | null): number | null;
