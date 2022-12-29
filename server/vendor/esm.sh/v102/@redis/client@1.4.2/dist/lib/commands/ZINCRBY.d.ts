import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(key: RedisCommandArgument, increment: number, member: RedisCommandArgument): RedisCommandArguments;
export { transformNumberInfinityReply as transformReply } from './generic-transformers.d.ts';
