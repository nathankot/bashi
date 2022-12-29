import { RedisCommandArguments } from './index.d.ts';
import { transformArguments as transformZDiffArguments } from './ZDIFF.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './ZDIFF.d.ts';
export declare function transformArguments(...args: Parameters<typeof transformZDiffArguments>): RedisCommandArguments;
export { transformSortedSetWithScoresReply as transformReply } from './generic-transformers.d.ts';
