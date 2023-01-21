import { RedisCommandArguments } from './index.d.ts';
import { transformArguments as transformZRandMemberCountArguments } from './ZRANDMEMBER_COUNT.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './ZRANDMEMBER_COUNT.d.ts';
export declare function transformArguments(...args: Parameters<typeof transformZRandMemberCountArguments>): RedisCommandArguments;
export { transformSortedSetWithScoresReply as transformReply } from './generic-transformers.d.ts';
