/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
import { RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(value: boolean): RedisCommandArguments;
export declare function transformReply(): 'OK' | Buffer;