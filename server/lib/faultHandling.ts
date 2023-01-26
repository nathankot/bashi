import {
  ExponentialBackoff,
  SamplingBreaker,
  retry,
  circuitBreaker,
  handleWhen,
  wrap,
} from "cockatiel";

import { RetryableError } from "@lib/errors.ts";

const handleRetryableError = handleWhen((e) => e instanceof RetryableError);

export const retryPolicy = retry(handleRetryableError, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff(),
});

// circuit breaker object needs to be re-used.
export const circuitBreakerPolicy =
  // if more than 20% of at least 20
  // requests fail in a 10s time window,
  // wait 10 seconds before attempting again:
  circuitBreaker(handleRetryableError, {
    halfOpenAfter: 10 * 1000,
    breaker: new SamplingBreaker({
      minimumRps: 2,
      threshold: 0.2,
      duration: 10 * 1000,
    }),
  });

export const defaultPolicy = wrap(retryPolicy, circuitBreakerPolicy);

export default defaultPolicy;
