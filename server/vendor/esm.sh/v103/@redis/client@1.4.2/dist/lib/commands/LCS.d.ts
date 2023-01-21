/// <reference path="https://esm.sh/v103/node.ns.d.ts" />
import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key1: RedisCommandArgument, key2: RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): string | Buffer;
