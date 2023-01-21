import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { LMPopOptions, ListSide } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 3;
export declare function transformArguments(timeout: number, keys: RedisCommandArgument | Array<RedisCommandArgument>, side: ListSide, options?: LMPopOptions): RedisCommandArguments;
export { transformReply } from './LMPOP.d.ts';
