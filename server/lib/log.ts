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

export function wrap<V extends { message: string }>(
  wrapObj: V,
  wrappedLog: LogFn
): LogFn {
  return (level: Level, v: unknown) => {
    if (level === "error" && v instanceof Error) {
      return wrappedLog("error", {
        ...wrapObj,
        error: v.message,
        stack: v.stack,
      });
    }
    return wrappedLog(level, {
      ...wrapObj,
      v,
    });
  };
}
