import * as t from "io-ts";

import * as b64 from "std/encoding/base64.ts";

import { Handlers } from "$fresh/server.ts";
import { OpenAPIV3 } from "openapi-types";

import { HTTPError } from "@lib/errors.ts";
import { SESSION_EXPIRY_MS } from "@lib/constants.ts";
import { renderError, renderJSON, handleError } from "@lib/util.ts";
import { wrap } from "@lib/log.ts";
import { SessionPublic, defaultConfiguration } from "@lib/session.ts";
import { FunctionSet, builtinFunctions } from "@lib/function.ts";
import { msgpack } from "@/msgpack.ts";
import toJSONSchema from "@lib/toJsonSchema.ts";

import { State } from "./_middleware.ts";

export const POSTRequest = t.intersection([
  t.type({
    modelConfigurations: SessionPublic.props.modelConfigurations,
  }),
  t.partial({
    configuration: SessionPublic.props.configuration,
  }),
]);
export type POSTRequest = t.TypeOf<typeof POSTRequest>;

export const POSTResponse = t.type({
  session: SessionPublic,
  builtinFunctions: FunctionSet,
});
export type POSTResponse = t.TypeOf<typeof POSTResponse>;

export const meta = {
  post: {
    operationId: "post_sessions",
    summary: "TODO",
    description: "TODO",
    security: [{ account_number: [] }],
    requestBody: {
      description: "TODO",
      content: {
        "application/json": {
          schema: toJSONSchema(POSTRequest),
          // TODO
          // example: {},
        },
      },
    },
    responses: {
      "200": {
        description: "TODO",
        content: {
          "application/json": {
            schema: toJSONSchema(POSTResponse),
            // TODO
            // example: {},
          },
        },
      },
      "400": { $ref: "#/components/responses/error" },
      "401": { $ref: "#/components/responses/error" },
      "403": { $ref: "#/components/responses/error" },
    },
  },
} satisfies OpenAPIV3.PathItemObject;

export const handler: Handlers<POSTResponse, State> = {
  async POST(req, ctx) {
    let log = ctx.state.log;

    const authorization = req.headers.get("Authorization");
    if (authorization == null) {
      return renderError(401, "no Authorization header found");
    }
    const accountNumber = authorization.substring("Bearer ".length);
    // TODO validate the api key

    log = wrap({ accountNumber }, log);

    let json;
    try {
      json = await req.json();
    } catch {
      return renderError(400, "could not parse json");
    }
    if (!POSTRequest.is(json)) {
      return renderError(400, "malformed request");
    }

    try {
      const sessionId = crypto.randomUUID();

      const expiresAt = new Date(ctx.state.now().getTime() + SESSION_EXPIRY_MS);

      const session: SessionPublic = {
        modelConfigurations: json.modelConfigurations,
        configuration: {
          ...defaultConfiguration,
          ...json.configuration,
        },
        expiresAt: expiresAt,
        sessionId,
        accountNumber,
      };

      // Ensure no builtin functions are being specified:
      for (const conf of Object.values(session.modelConfigurations)) {
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
          // TODO: unfortunately this uses b64 instead of
          // raw bytes because of an incompatibility when
          // deno imports @redis/client.
          .set("s:" + sessionId, b64.encode(sessionSerialized))
          .expireAt("s:" + sessionId, expiresAt)
          .exec()
      );

      return renderJSON<POSTResponse>(
        {
          session,
          builtinFunctions,
        },
        200
      );
    } catch (e) {
      return handleError(log, e);
    }
  },
};
