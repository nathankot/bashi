import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './LCS.d.ts';
export declare function transformArguments(key1: RedisCommandArgument, key2: RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): number;
