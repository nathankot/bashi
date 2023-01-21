import { IBackoff, IBackoffFactory } from './Backoff.d.ts';
export declare class IterableBackoff implements IBackoffFactory<unknown> {
    private readonly durations;
    /**
     * Backoff that returns a number from an iterable.
     */
    constructor(durations: ReadonlyArray<number>);
    /**
     * @inheritdoc
     */
    next(): IBackoff<unknown>;
}
