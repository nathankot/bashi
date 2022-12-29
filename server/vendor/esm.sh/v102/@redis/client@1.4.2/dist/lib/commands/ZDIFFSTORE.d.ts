import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(destination: RedisCommandArgument, keys: Array<RedisCommandArgument> | RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): number;
