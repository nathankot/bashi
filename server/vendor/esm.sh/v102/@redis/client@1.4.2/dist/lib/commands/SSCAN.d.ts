import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { ScanOptions } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key: RedisCommandArgument, cursor: number, options?: ScanOptions): RedisCommandArguments;
declare type SScanRawReply = [string, Array<RedisCommandArgument>];
interface SScanReply {
    cursor: number;
    members: Array<RedisCommandArgument>;
}
export declare function transformReply([cursor, members]: SScanRawReply): SScanReply;
export {};
