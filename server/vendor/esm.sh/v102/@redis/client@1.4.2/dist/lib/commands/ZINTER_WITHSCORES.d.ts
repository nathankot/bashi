import { RedisCommandArguments } from './index.d.ts';
import { transformArguments as transformZInterArguments } from './ZINTER.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './ZINTER.d.ts';
export declare function transformArguments(...args: Parameters<typeof transformZInterArguments>): RedisCommandArguments;
export { transformSortedSetWithScoresReply as transformReply } from './generic-transformers.d.ts';
