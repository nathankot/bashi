import { BrokenCircuitError } from './BrokenCircuitError.d.ts';
export declare class IsolatedCircuitError extends BrokenCircuitError {
    readonly isIsolatedCircuitError = true;
    /**
     * Exception thrown from {@link CircuitBreakerPolicy.execute} when the
     * circuit breaker is open.
     */
    constructor();
}
