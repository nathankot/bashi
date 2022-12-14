import { MiddlewareHandlerContext } from "$fresh/server.ts";
import * as clients from "@/clients.ts";

export interface State {
  clients: typeof clients;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>
) {
  ctx.state.clients = clients;
  const resp = await ctx.next();
  return resp;
}
