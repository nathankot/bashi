import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 2;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(keys: Array<RedisCommandArgument> | RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
