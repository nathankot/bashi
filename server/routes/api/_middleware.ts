import { MiddlewareHandlerContext } from "$fresh/server.ts";
import * as clients from "@lib/clients.ts";
import { LogFn, log } from "@lib/log.ts";

export interface State {
  clients: typeof clients;
  log: LogFn;
  now: Date;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>
) {
  ctx.state.clients = clients;
  ctx.state.now = new Date();
  ctx.state.log = log;
  const resp = await ctx.next();
  return resp;
}
