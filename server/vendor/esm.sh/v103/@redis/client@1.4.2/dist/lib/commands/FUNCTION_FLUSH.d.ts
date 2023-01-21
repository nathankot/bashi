import { RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(mode?: 'ASYNC' | 'SYNC'): RedisCommandArguments;
export declare function transformReply(): 'OK';
