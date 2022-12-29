/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
import COMMANDS from './commands.d.ts';
import { RedisCommand, RedisCommandArguments, RedisCommandRawReply, RedisCommandReply, RedisFunctions, RedisModules, RedisExtensions, RedisScript, RedisScripts, RedisCommandSignature, ConvertArgumentType, RedisFunction, ExcludeMappedString } from '../commands/index.d.ts';
import { RedisSocketOptions } from './socket.d.ts';
import { PubSubListener, QueueCommandOptions } from './commands-queue.d.ts';
import { RedisClientMultiCommandType } from './multi-command.d.ts';
import { RedisMultiQueuedCommand } from '../multi-command.d.ts';
import { EventEmitter } from 'https://esm.sh/v102/@types/node@16.18.10/events.d.ts';
import { CommandOptions } from '../command-options.d.ts';
import { ScanOptions, ZMember } from '../commands/generic-transformers.d.ts';
import { ScanCommandOptions } from '../commands/SCAN.d.ts';
import { HScanTuple } from '../commands/HSCAN.d.ts';
import { Options as PoolOptions } from 'https://esm.sh/v102/@types/generic-pool@3.1.11/index.d.ts';
export interface RedisClientOptions<M extends RedisModules = RedisModules, F extends RedisFunctions = RedisFunctions, S extends RedisScripts = RedisScripts> extends RedisExtensions<M, F, S> {
    url?: string;
    socket?: RedisSocketOptions;
    username?: string;
    password?: string;
    name?: string;
    database?: number;
    commandsQueueMaxLength?: number;
    disableOfflineQueue?: boolean;
    readonly?: boolean;
    legacyMode?: boolean;
    isolationPoolOptions?: PoolOptions;
    pingInterval?: number;
}
declare type WithCommands = {
    [P in keyof typeof COMMANDS]: RedisCommandSignature<(typeof COMMANDS)[P]>;
};
export declare type WithModules<M extends RedisModules> = {
    [P in keyof M as ExcludeMappedString<P>]: {
        [C in keyof M[P] as ExcludeMappedString<C>]: RedisCommandSignature<M[P][C]>;
    };
};
export declare type WithFunctions<F extends RedisFunctions> = {
    [P in keyof F as ExcludeMappedString<P>]: {
        [FF in keyof F[P] as ExcludeMappedString<FF>]: RedisCommandSignature<F[P][FF]>;
    };
};
export declare type WithScripts<S extends RedisScripts> = {
    [P in keyof S as ExcludeMappedString<P>]: RedisCommandSignature<S[P]>;
};
export declare type RedisClientType<M extends RedisModules = Record<string, never>, F extends RedisFunctions = Record<string, never>, S extends RedisScripts = Record<string, never>> = RedisClient<M, F, S> & WithCommands & WithModules<M> & WithFunctions<F> & WithScripts<S>;
export declare type InstantiableRedisClient<M extends RedisModules, F extends RedisFunctions, S extends RedisScripts> = new (options?: RedisClientOptions<M, F, S>) => RedisClientType<M, F, S>;
export interface ClientCommandOptions extends QueueCommandOptions {
    isolated?: boolean;
}
export default class RedisClient<M extends RedisModules, F extends RedisFunctions, S extends RedisScripts> extends EventEmitter {
    #private;
    static commandOptions<T extends ClientCommandOptions>(options: T): CommandOptions<T>;
    commandOptions: typeof RedisClient.commandOptions;
    static extend<M extends RedisModules, F extends RedisFunctions, S extends RedisScripts>(extensions?: RedisExtensions<M, F, S>): InstantiableRedisClient<M, F, S>;
    static create<M extends RedisModules, F extends RedisFunctions, S extends RedisScripts>(options?: RedisClientOptions<M, F, S>): RedisClientType<M, F, S>;
    static parseURL(url: string): RedisClientOptions;
    get options(): RedisClientOptions<M, F, S> | undefined;
    get isOpen(): boolean;
    get isReady(): boolean;
    get v4(): Record<string, any>;
    constructor(options?: RedisClientOptions<M, F, S>);
    duplicate(overrides?: Partial<RedisClientOptions<M, F, S>>): RedisClientType<M, F, S>;
    connect(): Promise<void>;
    commandsExecutor<C extends RedisCommand>(command: C, args: Array<unknown>): Promise<RedisCommandReply<C>>;
    sendCommand<T = RedisCommandRawReply>(args: RedisCommandArguments, options?: ClientCommandOptions): Promise<T>;
    functionsExecuter<F extends RedisFunction>(fn: F, args: Array<unknown>, name: string): Promise<RedisCommandReply<F>>;
    executeFunction(name: string, fn: RedisFunction, args: RedisCommandArguments, options?: ClientCommandOptions): Promise<RedisCommandRawReply>;
    scriptsExecuter<S extends RedisScript>(script: S, args: Array<unknown>): Promise<RedisCommandReply<S>>;
    executeScript(script: RedisScript, args: RedisCommandArguments, options?: ClientCommandOptions): Promise<RedisCommandRawReply>;
    SELECT(db: number): Promise<void>;
    SELECT(options: CommandOptions<ClientCommandOptions>, db: number): Promise<void>;
    select: {
        (db: number): Promise<void>;
        (options: CommandOptions<ClientCommandOptions>, db: number): Promise<void>;
    };
    SUBSCRIBE<T extends boolean = false>(channels: string | Array<string>, listener: PubSubListener<T>, bufferMode?: T): Promise<void>;
    subscribe: <T extends boolean = false>(channels: string | Array<string>, listener: PubSubListener<T, T extends true ? Buffer : string>, bufferMode?: T | undefined) => Promise<void>;
    PSUBSCRIBE<T extends boolean = false>(patterns: string | Array<string>, listener: PubSubListener<T>, bufferMode?: T): Promise<void>;
    pSubscribe: <T extends boolean = false>(patterns: string | Array<string>, listener: PubSubListener<T, T extends true ? Buffer : string>, bufferMode?: T | undefined) => Promise<void>;
    UNSUBSCRIBE<T extends boolean = false>(channels?: string | Array<string>, listener?: PubSubListener<T>, bufferMode?: T): Promise<void>;
    unsubscribe: <T extends boolean = false>(channels?: string | Array<string>, listener?: PubSubListener<T, T extends true ? Buffer : string> | undefined, bufferMode?: T | undefined) => Promise<void>;
    PUNSUBSCRIBE<T extends boolean = false>(patterns?: string | Array<string>, listener?: PubSubListener<T>, bufferMode?: T): Promise<void>;
    pUnsubscribe: <T extends boolean = false>(patterns?: string | Array<string>, listener?: PubSubListener<T, T extends true ? Buffer : string> | undefined, bufferMode?: T | undefined) => Promise<void>;
    QUIT(): Promise<void>;
    quit: () => Promise<void>;
    executeIsolated<T>(fn: (client: RedisClientType<M, F, S>) => T | Promise<T>): Promise<T>;
    MULTI(): RedisClientMultiCommandType<M, F, S>;
    multi: () => RedisClientMultiCommandType<M, F, S>;
    multiExecutor(commands: Array<RedisMultiQueuedCommand>, selectedDB?: number, chainId?: symbol): Promise<Array<RedisCommandRawReply>>;
    scanIterator(options?: ScanCommandOptions): AsyncIterable<string>;
    hScanIterator(key: string, options?: ScanOptions): AsyncIterable<ConvertArgumentType<HScanTuple, string>>;
    sScanIterator(key: string, options?: ScanOptions): AsyncIterable<string>;
    zScanIterator(key: string, options?: ScanOptions): AsyncIterable<ConvertArgumentType<ZMember, string>>;
    disconnect(): Promise<void>;
    ref(): void;
    unref(): void;
}
export {};
