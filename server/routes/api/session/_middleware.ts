import * as f from "fp-ts";
import * as b64 from "std/encoding/base64.ts";
import { msgpack } from "@/deps.ts";

import { MiddlewareHandlerContext } from "$fresh/server.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";

import { SESSION_EXPIRY_MS } from "@lib/constants.ts";
import { Session } from "@lib/session.ts";
import { renderError, handleError } from "@lib/util.ts";
import { wrap } from "@lib/log.ts";

export interface State {
  session: Session;
  updatedSession?: Session;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State & ApiState>
) {
  try {
    const authorization = req.headers.get("Authorization");
    if (authorization == null) {
      return renderError(401, "no Authorization header found");
    }

    if (!authorization.startsWith("Bearer ")) {
      return renderError(401, "malformed Authorization header");
    }

    const sessionId = authorization.substring("Bearer ".length);

    const bin: string | null = await ctx.state.clients.withRedis((client) =>
      client.get("s:" + sessionId)
    );

    if (bin == null) {
      return renderError(401, "session not found or expired");
    }

    // TODO: unfortunately this uses b64 instead of
    // raw bytes because of an incompatibility when
    // deno imports @redis/client.
    const deserialized = msgpack.deserialize(b64.decode(bin));
    const decoded = Session.decode(deserialized);

    if (f.either.isLeft(decoded)) {
      return renderError(500, "internal error");
    }

    const session: Session = decoded.right;
    if (session.expiresAt.getTime() < ctx.state.now().getTime()) {
      return renderError(401, "session not found or expired");
    }

    ctx.state.log = wrap(
      {
        sessionId,
        accountNumber: session.accountNumber,
      },
      ctx.state.log
    );
    ctx.state.session = session;

    const resp = await ctx.next();

    if (ctx.state.updatedSession != null) {
      const expiresAt = new Date(ctx.state.now().getTime() + SESSION_EXPIRY_MS);
      const sessionSerialized = msgpack.serialize(ctx.state.updatedSession);
      await ctx.state.clients.withRedis((client) =>
        client
          .multi()
          // TODO: unfortunately this uses b64 instead of
          // raw bytes because of an incompatibility when
          // deno imports @redis/client.
          .set("s:" + sessionId, b64.encode(sessionSerialized))
          .expireAt("s:" + sessionId, expiresAt)
          .exec()
      );
    }

    return resp;
  } catch (e) {
    return handleError(ctx.state.log, e);
  }
}
