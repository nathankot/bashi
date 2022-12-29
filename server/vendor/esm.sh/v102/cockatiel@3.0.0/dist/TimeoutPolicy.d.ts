/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
import { Event } from './common/Event.d.ts';
import { ExecuteWrapper } from './common/Executor.d.ts';
import { IPolicy } from './Policy.d.ts';
export declare enum TimeoutStrategy {
    /**
     * Cooperative timeouts will simply revoke the inner cancellation token,
     * assuming the caller handles cancellation and throws or returns appropriately.
     */
    Cooperative = "optimistic",
    /**
     * Aggressive cancellation immediately throws
     */
    Aggressive = "aggressive"
}
export interface ICancellationContext {
    signal: AbortSignal;
}
export declare class TimeoutPolicy implements IPolicy<ICancellationContext> {
    private readonly duration;
    private readonly strategy;
    private readonly executor;
    private readonly unref;
    readonly _altReturn: never;
    private readonly timeoutEmitter;
    /**
     * @inheritdoc
     */
    readonly onTimeout: Event<void>;
    /**
     * @inheritdoc
     */
    readonly onFailure: Event<import("./Policy.d.ts").IFailureEvent>;
    /**
     * @inheritdoc
     */
    readonly onSuccess: Event<import("./Policy.d.ts").ISuccessEvent>;
    constructor(duration: number, strategy: TimeoutStrategy, executor?: ExecuteWrapper, unref?: boolean);
    /**
     * When timing out, a referenced timer is created. This means the Node.js
     * event loop is kept active while we're waiting for the timeout, as long as
     * the function hasn't returned. Calling this method on the timeout builder
     * will unreference the timer, allowing the process to exit even if a
     * timeout might still be happening.
     */
    dangerouslyUnref(): TimeoutPolicy;
    /**
     * Executes the given function.
     * @param fn Function to execute. Takes in a nested cancellation token.
     * @throws a {@link TaskCancelledError} if a timeout occurs
     */
    execute<T>(fn: (context: ICancellationContext, signal: AbortSignal) => PromiseLike<T> | T, signal?: AbortSignal): Promise<T>;
}
