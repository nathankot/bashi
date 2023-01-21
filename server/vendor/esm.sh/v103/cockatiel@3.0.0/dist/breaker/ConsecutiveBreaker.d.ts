import { IBreaker } from './Breaker.d.ts';
export declare class ConsecutiveBreaker implements IBreaker {
    private readonly threshold;
    private count;
    /**
     * ConsecutiveBreaker breaks if more than `threshold` exceptions are received
     * over a time period.
     */
    constructor(threshold: number);
    /**
     * @inheritdoc
     */
    success(): void;
    /**
     * @inheritdoc
     */
    failure(): boolean;
}
