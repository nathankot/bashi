import { RedisCommandArguments } from './index.d.ts';
import { transformArguments as transformZRangeArguments } from './ZRANGE.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './ZRANGE.d.ts';
export declare function transformArguments(...args: Parameters<typeof transformZRangeArguments>): RedisCommandArguments;
export { transformSortedSetWithScoresReply as transformReply } from './generic-transformers.d.ts';
