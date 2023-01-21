import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { LPosOptions } from './LPOS.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './LPOS.d.ts';
export declare function transformArguments(key: RedisCommandArgument, element: RedisCommandArgument, count: number, options?: LPosOptions): RedisCommandArguments;
export declare function transformReply(): Array<number>;
