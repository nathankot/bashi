/// <reference path="https://esm.sh/v103/node.ns.d.ts" />
import { RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(value: boolean): RedisCommandArguments;
export declare function transformReply(): 'OK' | Buffer;
