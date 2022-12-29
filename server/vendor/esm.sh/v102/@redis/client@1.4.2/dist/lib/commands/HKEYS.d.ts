import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(key: RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
