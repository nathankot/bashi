import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(key: RedisCommandArgument, millisecondsTimestamp: number | Date, mode?: 'NX' | 'XX' | 'GT' | 'LT'): RedisCommandArguments;
export { transformBooleanReply as transformReply } from './generic-transformers.d.ts';
