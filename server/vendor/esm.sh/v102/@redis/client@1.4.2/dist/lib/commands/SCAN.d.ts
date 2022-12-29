import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { ScanOptions } from './generic-transformers.d.ts';
export declare const IS_READ_ONLY = true;
export interface ScanCommandOptions extends ScanOptions {
    TYPE?: RedisCommandArgument;
}
export declare function transformArguments(cursor: number, options?: ScanCommandOptions): RedisCommandArguments;
declare type ScanRawReply = [string, Array<string>];
export interface ScanReply {
    cursor: number;
    keys: Array<RedisCommandArgument>;
}
export declare function transformReply([cursor, keys]: ScanRawReply): ScanReply;
export {};
