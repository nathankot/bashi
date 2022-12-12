import * as t from "io-ts";
import * as f from "fp-ts";

import { Handlers } from "$fresh/server.ts";
import { Buffer } from "std/node/buffer.ts";

import { renderError, renderJSON, iotsPick } from "@/util.ts";
import { redis } from "@/clients.ts";
import { Session } from "@/types.ts";

// @deno-types="msgpack/msgpack.d.ts"
import msgpack from "msgpack";

const PostSessionRequest = iotsPick(Session, ["commands"]);
type PostSessionRequest = t.TypeOf<typeof PostSessionRequest>;

interface PostSessionResponse {
  sessionId: string;
  expiresAt: string;
}

export const handler: Handlers<PostSessionResponse> = {
  async POST(req, ctx) {
    const now = new Date();
    // TODO validate api key, for now just require it in the

    let json;
    try {
      json = await req.json();
    } catch {
      return renderError(400, "could not parse json");
    }
    const reqDecodeResult = PostSessionRequest.decode(json);
    if (f.either.isLeft(reqDecodeResult)) {
      return renderError(400, "malformed request");
    }

    const sessionId = crypto.randomUUID();
    const reqDecoded = reqDecodeResult.right as PostSessionRequest;
    const encodedSession = msgpack.encode({
      settings: reqDecoded,
    });

    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 3);
    await redis
      .multi()
      .set("s:" + sessionId, Buffer.from(encodedSession))
      .expireAt("s:" + sessionId, expiresAt)
      .exec();

    return renderJSON<PostSessionResponse>({
      sessionId,
      expiresAt: expiresAt.toISOString(),
    });
  },
};
