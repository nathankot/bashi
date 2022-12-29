import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(source: RedisCommandArgument, destination: RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): RedisCommandArgument | null;
