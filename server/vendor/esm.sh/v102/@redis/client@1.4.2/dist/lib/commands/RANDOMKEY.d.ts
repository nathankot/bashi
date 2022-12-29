import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const IS_READ_ONLY = true;
export declare function transformArguments(): RedisCommandArguments;
export declare function transformReply(): RedisCommandArgument | null;
