import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
interface XRangeRevOptions {
    COUNT?: number;
}
export declare function transformArguments(key: RedisCommandArgument, start: RedisCommandArgument, end: RedisCommandArgument, options?: XRangeRevOptions): RedisCommandArguments;
export { transformStreamMessagesReply as transformReply } from './generic-transformers.d.ts';
