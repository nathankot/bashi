/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
import { ExecuteWrapper } from './common/Executor.d.ts';
import { IDefaultPolicyContext, IPolicy } from './Policy.d.ts';
export declare class FallbackPolicy<AltReturn> implements IPolicy<IDefaultPolicyContext, AltReturn> {
    private readonly executor;
    private readonly value;
    readonly _altReturn: AltReturn;
    /**
     * @inheritdoc
     */
    readonly onSuccess: import("./index.d.ts").Event<import("./Policy.d.ts").ISuccessEvent>;
    /**
     * @inheritdoc
     */
    readonly onFailure: import("./index.d.ts").Event<import("./Policy.d.ts").IFailureEvent>;
    constructor(executor: ExecuteWrapper, value: () => AltReturn);
    /**
     * Executes the given function.
     * @param fn Function to execute.
     * @returns The function result or fallback value.
     */
    execute<T>(fn: (context: IDefaultPolicyContext) => PromiseLike<T> | T, signal?: AbortSignal): Promise<T | AltReturn>;
}
