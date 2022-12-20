import {
  ExponentialBackoff,
  SamplingBreaker,
  retry,
  circuitBreaker,
  handleWhen,
  wrap,
} from "cockatiel";

import HTTPError from "@lib/http_error.ts";

const handleInternalError = handleWhen(
  (e) => !(e instanceof HTTPError) || e.statusCode >= 500
);

export const retryPolicy = retry(handleInternalError, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff(),
});

// circuit breaker object needs to be re-used.
export const circuitBreakerPolicy =
  // if more than 20% of at least 20
  // requests fail in a 10s time window,
  // wait 10 seconds before attempting again:
  circuitBreaker(handleInternalError, {
    halfOpenAfter: 10 * 1000,
    breaker: new SamplingBreaker({
      minimumRps: 2,
      threshold: 0.2,
      duration: 10 * 1000,
    }),
  });

export const defaultPolicy = wrap(retryPolicy, circuitBreakerPolicy);

export default defaultPolicy;
