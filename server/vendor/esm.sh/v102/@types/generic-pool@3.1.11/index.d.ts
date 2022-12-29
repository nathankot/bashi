// Type definitions for generic-pool 3.1
// Project: https://github.com/coopernurse/node-pool#readme
// Definitions by: Jerray Fu <https://github.com/jerray>
//                 Will Boyce <https://github.com/wrboyce>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference path="https://esm.sh/v102/node.ns.d.ts" />

import { EventEmitter } from "https://esm.sh/v102/@types/node@16.18.10/events.d.ts";

export class Pool<T> extends EventEmitter {
    spareResourceCapacity: number;
    size: number;
    available: number;
    borrowed: number;
    pending: number;
    max: number;
    min: number;

    start(): void;
    acquire(priority?: number): PromiseLike<T>;
    release(resource: T): PromiseLike<void>;
    destroy(resource: T): PromiseLike<void>;
    drain(): PromiseLike<void>;
    clear(): PromiseLike<void>;
    use<U>(cb: (resource: T) => PromiseLike<U>): PromiseLike<U>;
    isBorrowedResource(resource: T): boolean;
}

export interface Factory<T> {
    create(): PromiseLike<T>;
    destroy(client: T): PromiseLike<void>;
    validate?(client: T): PromiseLike<boolean>;
}

export interface Options {
    max?: number | undefined;
    min?: number | undefined;
    maxWaitingClients?: number | undefined;
    testOnBorrow?: boolean | undefined;
    testOnReturn?: boolean | undefined;
    acquireTimeoutMillis?: number | undefined;
    fifo?: boolean | undefined;
    priorityRange?: number | undefined;
    autostart?: boolean | undefined;
    evictionRunIntervalMillis?: number | undefined;
    numTestsPerEvictionRun?: number | undefined;
    softIdleTimeoutMillis?: number | undefined;
    idleTimeoutMillis?: number | undefined;
}

export function createPool<T>(factory: Factory<T>, opts?: Options): Pool<T>;
