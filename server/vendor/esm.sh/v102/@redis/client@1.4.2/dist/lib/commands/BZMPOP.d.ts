import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { SortedSetSide, ZMPopOptions } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 3;
export declare function transformArguments(timeout: number, keys: RedisCommandArgument | Array<RedisCommandArgument>, side: SortedSetSide, options?: ZMPopOptions): RedisCommandArguments;
export { transformReply } from './ZMPOP.d.ts';
