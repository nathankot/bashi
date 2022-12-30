import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { ScanOptions } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key: RedisCommandArgument, cursor: number, options?: ScanOptions): RedisCommandArguments;
declare type HScanRawReply = [RedisCommandArgument, Array<RedisCommandArgument>];
export interface HScanTuple {
    field: RedisCommandArgument;
    value: RedisCommandArgument;
}
interface HScanReply {
    cursor: number;
    tuples: Array<HScanTuple>;
}
export declare function transformReply([cursor, rawTuples]: HScanRawReply): HScanReply;
export {};