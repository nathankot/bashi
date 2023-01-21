import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export { FIRST_KEY_INDEX, IS_READ_ONLY } from './HRANDFIELD_COUNT.d.ts';
export declare function transformArguments(key: RedisCommandArgument, count: number): RedisCommandArguments;
export { transformTuplesReply as transformReply } from './generic-transformers.d.ts';
