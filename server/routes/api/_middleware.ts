import { MiddlewareHandlerContext } from "$fresh/server.ts";
import * as clients from "@lib/clients.ts";

export interface State {
  clients: typeof clients;
  now: Date;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>
) {
  ctx.state.clients = clients;
  ctx.state.now = new Date();
  const resp = await ctx.next();
  return resp;
}
