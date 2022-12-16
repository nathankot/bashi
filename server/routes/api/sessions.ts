import * as t from "io-ts";
import * as f from "fp-ts";

import { Handlers } from "$fresh/server.ts";
import { Buffer } from "std/node/buffer.ts";

import { State } from "./_middleware.ts";
import { renderError, renderJSON } from "@lib/util.ts";
import { Session } from "@lib/types.ts";
import { msgpack } from "@/deps.ts";

const PostSessionRequest = t.type({
  modelConfigurations: Session.props.modelConfigurations,
});
export type PostSessionRequest = t.TypeOf<typeof PostSessionRequest>;
export type PostSessionResponse = Session;

export const handler: Handlers<PostSessionResponse, State> = {
  async POST(req, ctx) {
    // TODO validate the api key

    let json;
    try {
      json = await req.json();
    } catch {
      return renderError(400, "could not parse json");
    }
    const reqDecodeResult: t.Validation<PostSessionRequest> =
      PostSessionRequest.decode(json);
    if (!f.either.isRight(reqDecodeResult)) {
      return renderError(400, "malformed request");
    }

    const sessionId = crypto.randomUUID();
    const reqDecoded: PostSessionRequest = reqDecodeResult.right as any;

    const expiresAt = new Date(ctx.state.now.getTime() + 1000 * 60 * 60 * 3);

    const session: Session = {
      ...reqDecoded,
      expiresAt: expiresAt,
      sessionId,
    };

    const sessionSerialized = msgpack.serialize(session);

    await ctx.state.clients.withRedis((client) =>
      client
        .multi()
        .set("s:" + sessionId, Buffer.from(sessionSerialized))
        .expireAt("s:" + sessionId, expiresAt)
        .exec()
    );

    return renderJSON<PostSessionResponse>(session);
  },
};
