import { RedisCommandArguments } from './index.d.ts';
import { transformArguments as transformZUnionArguments } from './ZUNION.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './ZUNION.d.ts';
export declare function transformArguments(...args: Parameters<typeof transformZUnionArguments>): RedisCommandArguments;
export { transformSortedSetWithScoresReply as transformReply } from './generic-transformers.d.ts';
