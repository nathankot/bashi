import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 2;
export declare function transformArguments(key: RedisCommandArgument, group: RedisCommandArgument): RedisCommandArguments;
export { transformBooleanReply as transformReply } from './generic-transformers.d.ts';
