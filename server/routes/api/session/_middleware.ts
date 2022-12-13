import * as f from "fp-ts";

import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { Buffer } from "std/node/buffer.ts";

import msgpack from "@/msgpack.ts";
import { Session } from "@/types.ts";
import { withRedis } from "@/clients.ts";
import { renderError } from "@/util.ts";

export interface State {
  session?: Session;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>
) {
  const authorization = req.headers.get("Authorization");
  if (authorization == null) {
    return renderError(401, "no Authorization header found");
  }

  if (!authorization.startsWith("Bearer ")) {
    return renderError(401, "malformed Authorization header");
  }

  const sessionId = authorization.substring("Bearer ".length);

  const bin: Buffer | null = await withRedis((client) =>
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
  ctx.state.session = session;

  const resp = await ctx.next();
  return resp;
}
