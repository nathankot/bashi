import { HTTPError, RetryableError } from "./errors.ts";
import { LogFn } from "@lib/log.ts";

export function handleError(log: LogFn, e: unknown): Response {
  if (e instanceof RetryableError) {
    e = e.wrapped;
  }
  if (e instanceof HTTPError) {
    return e.render();
  }
  if (e instanceof Error) {
    log("error", e);
  }
  if (e instanceof Object && "message" in e && typeof e.message === "string") {
    log("error", { message: e.message });
  }
  if (typeof e === "string") {
    log("error", { message: e });
  }
  log("error", "got error with unexpected type");
  return renderError(500, "internal server error");
}

export function renderError<T extends {}>(
  statusCode: 400 | 403 | 404 | 401 | 500,
  message: string,
  mergeWith?: T
): Response {
  return new Response(JSON.stringify({ error: message, ...mergeWith }), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function renderJSON<T extends {}>(
  json: T,
  status: 200 | 201 = 200
): Response {
  return new Response(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
