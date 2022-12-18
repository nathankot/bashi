import { Session } from "@lib/session.ts";
import { Output } from "@lib/models.ts";
import { LogFn } from "@lib/log.ts";

export type OutputInterceptor<O extends Output> = (
  log: LogFn,
  session: Session,
  output: O
) => Promise<O>;
