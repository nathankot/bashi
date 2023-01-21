import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
declare type LInsertPosition = 'BEFORE' | 'AFTER';
export declare function transformArguments(key: RedisCommandArgument, position: LInsertPosition, pivot: RedisCommandArgument, element: RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): number;
export {};
