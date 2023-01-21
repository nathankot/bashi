import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(pattern: RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
