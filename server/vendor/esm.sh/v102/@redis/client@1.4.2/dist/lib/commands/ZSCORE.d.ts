import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key: RedisCommandArgument, member: RedisCommandArgument): RedisCommandArguments;
export { transformNumberInfinityNullReply as transformReply } from './generic-transformers.d.ts';
