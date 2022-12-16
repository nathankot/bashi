import * as f from "fp-ts";

import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { Buffer } from "std/node/buffer.ts";

import { State as ApiState } from "../_middleware.ts";
import { msgpack } from "@/deps.ts";
import { Session } from "@lib/session.ts";
import { renderError } from "@lib/util.ts";

export interface State {
  session: Session;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State & ApiState>
) {
  const authorization = req.headers.get("Authorization");
  if (authorization == null) {
    return renderError(401, "no Authorization header found");
  }

  if (!authorization.startsWith("Bearer ")) {
    return renderError(401, "malformed Authorization header");
  }

  const sessionId = authorization.substring("Bearer ".length);

  const bin: Buffer | null = await ctx.state.clients.withRedis((client) =>
    client.get(
      client.commandOptions({
        returnBuffers: true,
      }),
      "s:" + sessionId
    )
  );

  if (bin == null) {
    return renderError(401, "session not found or expired");
  }

  const deserialized = msgpack.deserialize(bin.buffer);
  const decoded = Session.decode(deserialized);

  if (f.either.isLeft(decoded)) {
    return renderError(500, "internal error");
  }

  const session: Session = decoded.right;
  if (session.expiresAt.getTime() < ctx.state.now.getTime()) {
    return renderError(401, "session not found or expired");
  }

  ctx.state.session = session;

  const resp = await ctx.next();
  return resp;
}
