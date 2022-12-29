import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { BitValue } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key: RedisCommandArgument, offset: number): RedisCommandArguments;
export declare function transformReply(): BitValue;
