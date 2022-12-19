import * as l from "std/log/mod.ts";

export type Level = "debug" | "critical" | "error" | "info";

export type LogFn = typeof log;

export async function setup() {
  await l.setup({
    handlers: {
      console: new l.handlers.ConsoleHandler("DEBUG"),
    },
  });
  log("info", { message: "logger is set up" });
}

export function log<E extends Error>(level: "error", e: E): void;
export function log<V extends { message: string }>(level: Level, v: V): void;
export function log(level: Level, v: unknown): void {
  if (level === "error" && v instanceof Error) {
    log("error", { message: "error", error: v.message, stack: v.stack });
    return;
  }

  const logger = l.getLogger();
  logger[level](v);
  return;
}

export function wrap<V extends {}>(wrapObj: V, wrappedLog: LogFn): LogFn {
  return (level: Level, v: { message: string } | Error) => {
    if (level === "error") {
      if (!(v instanceof Error)) {
        throw new Error("must use 'error' log type to log errors");
      }
      return wrappedLog("error", {
        ...wrapObj,
        message: "error",
        error: v.message,
        stack: v.stack,
      });
    }
    if (v instanceof Error) {
      throw new Error("must use 'error' log type to log errors");
    }
    if (v == null || typeof v !== "object") {
      throw new Error("log expects an object");
    }
    if (!("message" in v)) {
      throw new Error("log has no message");
    }
    return wrappedLog(level, {
      ...wrapObj,
      ...v,
    });
  };
}
