import { RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(key: string | Array<string>): RedisCommandArguments;
export declare function transformReply(): string;
