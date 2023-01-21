/// <reference path="https://esm.sh/v103/node.ns.d.ts" />
import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
interface CommonOptions {
    REDIRECT?: number;
    NOLOOP?: boolean;
}
interface BroadcastOptions {
    BCAST?: boolean;
    PREFIX?: RedisCommandArgument | Array<RedisCommandArgument>;
}
interface OptInOptions {
    OPTIN?: boolean;
}
interface OptOutOptions {
    OPTOUT?: boolean;
}
declare type ClientTrackingOptions = CommonOptions & (BroadcastOptions | OptInOptions | OptOutOptions);
export declare function transformArguments<M extends boolean>(mode: M, options?: M extends true ? ClientTrackingOptions : undefined): RedisCommandArguments;
export declare function transformReply(): 'OK' | Buffer;
export {};
