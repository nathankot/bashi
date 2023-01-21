/**
 * A generic type that returns backoff intervals.
 */
export interface IBackoffFactory<T> {
    /**
     * Returns the first backoff duration. Can return "undefined" to signal
     * that we should not back off.
     */
    next(context: T): IBackoff<T>;
}
/**
 * A generic type that returns backoff intervals.
 */
export interface IBackoff<T> extends IBackoffFactory<T> {
    /**
     * Returns the number of milliseconds to wait for this backoff attempt.
     */
    readonly duration: number;
}
export * from './ConstantBackoff.d.ts';
export * from './DelegateBackoff.d.ts';
export * from './ExponentialBackoff.d.ts';
export * from './ExponentialBackoffGenerators.d.ts';
export * from './IterableBackoff.d.ts';
