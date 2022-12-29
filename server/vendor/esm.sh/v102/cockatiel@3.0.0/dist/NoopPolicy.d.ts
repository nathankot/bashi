/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
import { IDefaultPolicyContext, IPolicy } from './Policy.d.ts';
/**
 * A no-op policy, useful for unit tests and stubs.
 */
export declare class NoopPolicy implements IPolicy {
    readonly _altReturn: never;
    private readonly executor;
    readonly onSuccess: import("./index.d.ts").Event<import("./Policy.d.ts").ISuccessEvent>;
    readonly onFailure: import("./index.d.ts").Event<import("./Policy.d.ts").IFailureEvent>;
    execute<T>(fn: (context: IDefaultPolicyContext) => PromiseLike<T> | T, signal?: AbortSignal): Promise<T>;
}
