import * as t from "io-ts";

import { renderError } from "./util.ts";

type SupportedCode = 400 | 401 | 404 | 500;

export class RetryableError extends Error {
  wrapped: Error;

  constructor(wrapped: Error) {
    super(wrapped.message, {
      cause: wrapped.cause,
    });

    this.wrapped = wrapped;
    this.name = wrapped.name;
    this.stack = wrapped.stack;
  }
}

export class HTTPError extends Error {
  wrapped: Error | null = null;
  statusCode: SupportedCode;

  constructor(message: string | Error, statusCode: SupportedCode) {
    if (typeof message === "string") {
      super(message);
    } else {
      super(message.message, {
        cause: message.cause,
      });
      this.wrapped = message;
    }
    this.statusCode = statusCode;
  }

  render(): Response {
    return renderError(this.statusCode, this.message);
  }
}

export const ResponseError = t.type({
  error: t.string,
});

export type ResponseError = t.TypeOf<typeof ResponseError>;
