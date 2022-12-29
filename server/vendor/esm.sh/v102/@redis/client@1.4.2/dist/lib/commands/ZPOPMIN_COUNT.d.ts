import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export { FIRST_KEY_INDEX } from './ZPOPMIN.d.ts';
export declare function transformArguments(key: RedisCommandArgument, count: number): RedisCommandArguments;
export { transformSortedSetWithScoresReply as transformReply } from './generic-transformers.d.ts';
