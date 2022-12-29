import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(key: RedisCommandArgument, min: RedisCommandArgument | number, max: RedisCommandArgument | number): RedisCommandArguments;
export declare function transformReply(): number;
