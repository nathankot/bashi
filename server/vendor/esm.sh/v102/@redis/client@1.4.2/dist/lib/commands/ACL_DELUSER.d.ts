import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(username: RedisCommandArgument | Array<RedisCommandArgument>): RedisCommandArguments;
export declare function transformReply(): number;
