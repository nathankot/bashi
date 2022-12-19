import { MiddlewareHandlerContext } from "$fresh/server.ts";
import * as clients from "@lib/clients.ts";
import { LogFn, log, wrap } from "@lib/log.ts";

export interface State {
  clients: typeof clients;
  log: LogFn;
  now: () => Date;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>
) {
  const now = new Date();
  ctx.state.clients = clients;
  ctx.state.now = () => new Date(now);
  ctx.state.log = wrap({ requested_at: now.toISOString() }, log);
  const resp = await ctx.next();
  return resp;
}
