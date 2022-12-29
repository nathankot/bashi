import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { SortedSetSide, ZMember, ZMPopOptions } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 2;
export declare function transformArguments(keys: RedisCommandArgument | Array<RedisCommandArgument>, side: SortedSetSide, options?: ZMPopOptions): RedisCommandArguments;
declare type ZMPopRawReply = null | [
    key: string,
    elements: Array<[RedisCommandArgument, RedisCommandArgument]>
];
declare type ZMPopReply = null | {
    key: string;
    elements: Array<ZMember>;
};
export declare function transformReply(reply: ZMPopRawReply): ZMPopReply;
export {};
