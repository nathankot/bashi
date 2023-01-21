import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const IS_READ_ONLY = true;
export declare function transformArguments(args: Array<RedisCommandArgument>): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
