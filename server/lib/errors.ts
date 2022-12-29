import * as t from "io-ts";

import { renderError } from "./util.ts";

type SupportedCode = 400 | 401 | 404 | 500;

export class HTTPError extends Error {
  statusCode: SupportedCode;

  constructor(message: string, statusCode: SupportedCode) {
    super(message);
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