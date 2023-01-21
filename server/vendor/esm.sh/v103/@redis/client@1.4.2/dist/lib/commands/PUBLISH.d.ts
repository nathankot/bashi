import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(channel: RedisCommandArgument, message: RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): number;
