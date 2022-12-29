import { RedisFlushModes } from './FLUSHALL.d.ts';
export declare function transformArguments(mode?: RedisFlushModes): Array<string>;
export declare function transformReply(): string;
