import * as stdLog from "std/log/mod.ts";

export type Level = "debug" | "critical" | "info" | "error";

export type LogFn = typeof log;

export async function setup() {
  await stdLog.setup({
    handlers: {
      console: new stdLog.handlers.ConsoleHandler("DEBUG", {
        formatter: "{msg}",
      }),
    },
    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console"],
      },
    },
  });
  log("info", "logger is set up");
}

export function log(level: Level, v: string): void;
export function log<V extends { message: string }>(level: Level, v: V): void;
export function log(l: Level, v: any): void {
  const logger = stdLog.getLogger();

  if (v instanceof Error && l === "error") {
    logger["error"]({
      level: "error",
      message: v.message,
      stack: v.stack,
    });
    return;
  }

  if (typeof v === "string") {
    logger[l]({
      level: l,
      message: v,
    });
    return;
  }

  logger[l]({
    ...v,
    level: l,
  });
  return;
}

export function wrap<V extends {}>(wrapObj: V, wrappedLog: LogFn): LogFn {
  return (l: Level, v: any) => {
    if (v instanceof Error) {
      return wrappedLog(l, v);
    }
    if (typeof v === "string") {
      return wrappedLog(l, {
        ...wrapObj,
        message: v,
      });
    }
    return wrappedLog(l, {
      ...wrapObj,
      ...v,
    });
  };
}
