import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './ZRANDMEMBER.d.ts';
export declare function transformArguments(key: RedisCommandArgument, count: number): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
