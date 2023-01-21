import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(dump: RedisCommandArgument, mode?: 'FLUSH' | 'APPEND' | 'REPLACE'): RedisCommandArguments;
export declare function transformReply(): 'OK';
