import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 2;
declare type BitOperations = 'AND' | 'OR' | 'XOR' | 'NOT';
export declare function transformArguments(operation: BitOperations, destKey: RedisCommandArgument, key: RedisCommandArgument | Array<RedisCommandArgument>): RedisCommandArguments;
export declare function transformReply(): number;
export {};
