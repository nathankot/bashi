import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX: (streams: Array<XReadStream> | XReadStream) => RedisCommandArgument;
export declare const IS_READ_ONLY = true;
interface XReadStream {
    key: RedisCommandArgument;
    id: RedisCommandArgument;
}
interface XReadOptions {
    COUNT?: number;
    BLOCK?: number;
}
export declare function transformArguments(streams: Array<XReadStream> | XReadStream, options?: XReadOptions): RedisCommandArguments;
export { transformStreamsMessagesReply as transformReply } from './generic-transformers.d.ts';
