/// <reference path="https://esm.sh/v103/node.ns.d.ts" />
import { IBreaker } from './breaker/Breaker.d.ts';
import { ExecuteWrapper } from './common/Executor.d.ts';
import { FailureReason, IDefaultPolicyContext, IPolicy } from './Policy.d.ts';
export declare enum CircuitState {
    /**
     * Normal operation. Execution of actions allowed.
     */
    Closed = 0,
    /**
     * The automated controller has opened the circuit. Execution of actions blocked.
     */
    Open = 1,
    /**
     * Recovering from open state, after the automated break duration has
     * expired. Execution of actions permitted. Success of subsequent action/s
     * controls onward transition to Open or Closed state.
     */
    HalfOpen = 2,
    /**
     * Circuit held manually in an open state. Execution of actions blocked.
     */
    Isolated = 3
}
export interface ICircuitBreakerOptions {
    breaker: IBreaker;
    halfOpenAfter: number;
}
export declare class CircuitBreakerPolicy implements IPolicy {
    private readonly options;
    private readonly executor;
    readonly _altReturn: never;
    private readonly breakEmitter;
    private readonly resetEmitter;
    private readonly halfOpenEmitter;
    private readonly stateChangeEmitter;
    private innerLastFailure?;
    private innerState;
    /**
     * Event emitted when the circuit breaker opens.
     */
    readonly onBreak: import("./common/Event.d.ts").Event<FailureReason<unknown> | {
        isolated: true;
    }>;
    /**
     * Event emitted when the circuit breaker resets.
     */
    readonly onReset: import("./common/Event.d.ts").Event<void>;
    /**
     * Event emitted when the circuit breaker is half open (running a test call).
     * Either `onBreak` on `onReset` will subsequently fire.
     */
    readonly onHalfOpen: import("./common/Event.d.ts").Event<void>;
    /**
     * Fired whenever the circuit breaker state changes.
     */
    readonly onStateChange: import("./common/Event.d.ts").Event<CircuitState>;
    /**
     * @inheritdoc
     */
    readonly onSuccess: import("./common/Event.d.ts").Event<import("./Policy.d.ts").ISuccessEvent>;
    /**
     * @inheritdoc
     */
    readonly onFailure: import("./common/Event.d.ts").Event<import("./Policy.d.ts").IFailureEvent>;
    /**
     * Gets the current circuit breaker state.
     */
    get state(): CircuitState;
    /**
     * Gets the last reason the circuit breaker failed.
     */
    get lastFailure(): FailureReason<unknown> | undefined;
    constructor(options: ICircuitBreakerOptions, executor: ExecuteWrapper);
    /**
     * Manually holds open the circuit breaker.
     * @returns A handle that keeps the breaker open until `.dispose()` is called.
     */
    isolate(): {
        dispose: () => void;
    };
    /**
     * Executes the given function.
     * @param fn Function to run
     * @throws a {@link BrokenCircuitError} if the circuit is open
     * @throws a {@link IsolatedCircuitError} if the circuit is held
     * open via {@link CircuitBreakerPolicy.isolate}
     * @returns a Promise that resolves or rejects with the function results.
     */
    execute<T>(fn: (context: IDefaultPolicyContext) => PromiseLike<T> | T, signal?: AbortSignal): Promise<T>;
    private halfOpen;
    private open;
    private close;
}
