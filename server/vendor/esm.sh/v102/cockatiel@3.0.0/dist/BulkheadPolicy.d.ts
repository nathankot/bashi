/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
import { IDefaultPolicyContext, IPolicy } from './Policy.d.ts';
export declare class BulkheadPolicy implements IPolicy {
    private readonly capacity;
    private readonly queueCapacity;
    readonly _altReturn: never;
    private active;
    private readonly queue;
    private readonly onRejectEmitter;
    private readonly executor;
    /**
     * @inheritdoc
     */
    readonly onSuccess: import("./common/Event.d.ts").Event<import("./Policy.d.ts").ISuccessEvent>;
    /**
     * @inheritdoc
     */
    readonly onFailure: import("./common/Event.d.ts").Event<import("./Policy.d.ts").IFailureEvent>;
    /**
     * Emitter that fires when an item is rejected from the bulkhead.
     */
    readonly onReject: import("./common/Event.d.ts").Event<void>;
    /**
     * Returns the number of available execution slots at this point in time.
     */
    get executionSlots(): number;
    /**
     * Returns the number of queue slots at this point in time.
     */
    get queueSlots(): number;
    /**
     * Bulkhead limits concurrent requests made.
     */
    constructor(capacity: number, queueCapacity: number);
    /**
     * Executes the given function.
     * @param fn Function to execute
     * @throws a {@link BulkheadRejectedException} if the bulkhead limits are exceeeded
     */
    execute<T>(fn: (context: IDefaultPolicyContext) => PromiseLike<T> | T, signal?: AbortSignal): Promise<T>;
    private dequeue;
}
