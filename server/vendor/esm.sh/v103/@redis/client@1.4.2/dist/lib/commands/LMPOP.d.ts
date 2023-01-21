import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { LMPopOptions, ListSide } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 2;
export declare function transformArguments(keys: RedisCommandArgument | Array<RedisCommandArgument>, side: ListSide, options?: LMPopOptions): RedisCommandArguments;
export declare function transformReply(): null | [
    key: string,
    elements: Array<string>
];
