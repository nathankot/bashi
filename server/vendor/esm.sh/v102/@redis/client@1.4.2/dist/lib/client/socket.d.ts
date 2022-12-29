/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
import { EventEmitter } from 'https://esm.sh/v102/@types/node@16.18.10/events.d.ts';
import * as net from 'https://esm.sh/v102/@types/node@16.18.10/net.d.ts';
import * as tls from 'https://esm.sh/v102/@types/node@16.18.10/tls.d.ts';
import { RedisCommandArguments } from '../commands/index.d.ts';
export interface RedisSocketCommonOptions {
    connectTimeout?: number;
    noDelay?: boolean;
    keepAlive?: number | false;
    reconnectStrategy?(retries: number): number | Error;
}
declare type RedisNetSocketOptions = Partial<net.SocketConnectOpts> & {
    tls?: false;
};
export interface RedisTlsSocketOptions extends tls.ConnectionOptions {
    tls: true;
}
export declare type RedisSocketOptions = RedisSocketCommonOptions & (RedisNetSocketOptions | RedisTlsSocketOptions);
export declare type RedisSocketInitiator = () => Promise<void>;
export default class RedisSocket extends EventEmitter {
    #private;
    get isOpen(): boolean;
    get isReady(): boolean;
    get writableNeedDrain(): boolean;
    constructor(initiator: RedisSocketInitiator, options?: RedisSocketOptions);
    reconnectStrategy(retries: number): number | Error;
    connect(): Promise<void>;
    writeCommand(args: RedisCommandArguments): void;
    disconnect(): void;
    quit(fn: () => Promise<unknown>): Promise<void>;
    cork(): void;
    ref(): void;
    unref(): void;
}
export {};
