import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { ZRangeByScoreOptions } from './ZRANGEBYSCORE.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './ZRANGEBYSCORE.d.ts';
export declare function transformArguments(key: RedisCommandArgument, min: string | number, max: string | number, options?: ZRangeByScoreOptions): RedisCommandArguments;
export { transformSortedSetWithScoresReply as transformReply } from './generic-transformers.d.ts';
