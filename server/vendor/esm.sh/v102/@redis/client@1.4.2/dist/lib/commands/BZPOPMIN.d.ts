import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(key: RedisCommandArgument | Array<RedisCommandArgument>, timeout: number): RedisCommandArguments;
export { transformReply } from './BZPOPMAX.d.ts';
