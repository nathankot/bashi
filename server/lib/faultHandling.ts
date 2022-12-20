import {
  ExponentialBackoff,
  SamplingBreaker,
  TimeoutStrategy,
  retry,
  circuitBreaker,
  handleWhen,
  timeout,
  wrap,
} from "cockatiel";

import HTTPError from "@lib/http_error.ts";

const handleInternalError = handleWhen(
  (e) => !(e instanceof HTTPError) || e.statusCode >= 500
);

// circuit breaker object needs to be re-used.
const cb =
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

export const defaultPolicy = wrap(
  retry(handleInternalError, {
    maxAttempts: 3,
    backoff: new ExponentialBackoff(),
  }),
  cb,
  // note that the underlying executed function needs
  // to respect the passed in AbortSignal in order for
  // this to work.
  timeout(5000, TimeoutStrategy.Cooperative)
);
