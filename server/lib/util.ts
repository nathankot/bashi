import HTTPError from "./http_error.ts";
import { LogFn } from "@lib/log.ts";

export function handleError(log: LogFn, e: unknown): Response {
  if (e instanceof HTTPError) {
    return e.render();
  }
  if (e instanceof Error) {
    log("error", e);
  }
  if (e instanceof Object && "message" in e) {
    log("error", e);
  }
  if (typeof e === "string") {
    log("error", { message: e });
  }
  log("error", { message: "got error with unexpected type" });
  return renderError(500, "internal server error");
}

export function renderError<T extends {}>(
  statusCode: 400 | 404 | 401 | 500,
  message: string,
  mergeWith?: T
): Response {
  return new Response(JSON.stringify({ error: message, ...mergeWith }), {
    status: 400,
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
