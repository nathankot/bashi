import * as t from "io-ts";
import * as f from "fp-ts";

import { Handlers } from "$fresh/server.ts";
import { Buffer } from "std/node/buffer.ts";

import HTTPError from "@lib/http_error.ts";
import { SESSION_EXPIRY_MS } from "@lib/constants.ts";
import { State } from "./_middleware.ts";
import { renderError, renderJSON, handleError } from "@lib/util.ts";
import { Session, defaultGlobalConfiguration } from "@lib/session.ts";
import { FunctionSet, builtinFunctions } from "@lib/function.ts";
import { msgpack } from "@/deps.ts";

const PostSessionRequest = t.intersection([
  t.type({
    modelConfigurations: Session.props.modelConfigurations,
  }),
  t.partial({
    globalConfiguration: Session.props.globalConfiguration,
  }),
]);
export type PostSessionRequest = t.TypeOf<typeof PostSessionRequest>;

export const PostSessionResponse = t.type({
  session: Session,
  builtinFunctions: FunctionSet,
});
export type PostSessionResponse = t.TypeOf<typeof PostSessionResponse>;

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

    try {
      const sessionId = crypto.randomUUID();
      const reqDecoded: PostSessionRequest = reqDecodeResult.right as any;

      const expiresAt = new Date(ctx.state.now.getTime() + SESSION_EXPIRY_MS);

      const session: Session = {
        modelConfigurations: reqDecoded.modelConfigurations,
        globalConfiguration: {
          ...defaultGlobalConfiguration,
          ...reqDecoded.globalConfiguration,
        },
        expiresAt: expiresAt,
        sessionId,
      };

      // Ensure no builtin functions are being specified:
      for (const conf of session.modelConfigurations) {
        if (!("functions" in conf)) {
          continue;
        }
        for (const customFunction of Object.keys(conf.functions)) {
          if (customFunction in builtinFunctions) {
            throw new HTTPError(
              `'${customFunction}' is a builtin function and must not be specified`,
              400
            );
          }
        }
      }

      const sessionSerialized = msgpack.serialize(session);

      await ctx.state.clients.withRedis((client) =>
        client
          .multi()
          .set("s:" + sessionId, Buffer.from(sessionSerialized))
          .expireAt("s:" + sessionId, expiresAt)
          .exec()
      );

      return renderJSON<PostSessionResponse>({
        session,
        builtinFunctions,
      });
    } catch (e) {
      return handleError(e);
    }
  },
};
