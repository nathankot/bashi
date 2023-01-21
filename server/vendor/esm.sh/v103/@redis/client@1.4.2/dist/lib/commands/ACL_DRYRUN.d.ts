import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const IS_READ_ONLY = true;
export declare function transformArguments(username: RedisCommandArgument, command: Array<RedisCommandArgument>): RedisCommandArguments;
export declare function transformReply(): RedisCommandArgument;
