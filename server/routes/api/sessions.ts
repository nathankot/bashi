import * as t from "io-ts";
import * as f from "fp-ts";

import * as b64 from "std/encoding/base64.ts";

import { Handlers } from "$fresh/server.ts";
import { OpenAPIV3 } from "openapi-types";

import { HTTPError, ResponseError } from "@lib/errors.ts";
import { SESSION_EXPIRY_MS } from "@lib/constants.ts";
import { renderError, renderJSON, handleError } from "@lib/util.ts";
import { wrap } from "@lib/log.ts";
import { Session, defaultConfiguration } from "@lib/session.ts";
import { FunctionSet, builtinFunctions } from "@lib/function.ts";
import { msgpack } from "@/msgpack.ts";
import toJSONSchema from "@lib/to_json_schema.ts";

import { State } from "./_middleware.ts";

export const POSTRequest = t.intersection([
  t.type({
    modelConfigurations: Session.types[0].props.modelConfigurations,
  }),
  t.partial({
    configuration: Session.types[0].props.configuration,
  }),
]);
export type POSTRequest = t.TypeOf<typeof POSTRequest>;

export const POSTResponse = t.type({
  session: Session,
  builtinFunctions: FunctionSet,
});
export type POSTResponse = t.TypeOf<typeof POSTResponse>;

export const meta = {
  operationId: "postSessions",
  summary: "TODO",
  description: "TODO",
  parameters: [] as OpenAPIV3.OperationObject["parameters"],
  requestBody: {
    description: "TODO",
    required: true,
    content: {
      "application/json": {
        schema: toJSONSchema(POSTRequest),
        // TODO
        // example: {},
      },
    } satisfies OpenAPIV3.RequestBodyObject["content"],
  },
  responseSuccess: {
    status: 200 as 200,
    description: "TODO",
    content: {
      "application/json": {
        schema: toJSONSchema(POSTResponse),
        // TODO
        // example: {},
      },
    },
  },
  otherResponses: {
    "401": {
      description: "TODO",
      content: {
        "application/json": {
          schema: toJSONSchema(ResponseError),
        },
      },
    },
    "400": {
      description: "TODO",
      content: {
        "application/json": {
          schema: toJSONSchema(ResponseError),
        },
      },
    },
  } satisfies OpenAPIV3.OperationObject["responses"],
};

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
    const reqDecodeResult: t.Validation<POSTRequest> = POSTRequest.decode(json);
    if (!f.either.isRight(reqDecodeResult)) {
      return renderError(400, "malformed request");
    }

    try {
      const sessionId = crypto.randomUUID();
      const reqDecoded: POSTRequest = reqDecodeResult.right as any;

      const expiresAt = new Date(ctx.state.now().getTime() + SESSION_EXPIRY_MS);

      const session: Session = {
        modelConfigurations: reqDecoded.modelConfigurations,
        configuration: {
          ...defaultConfiguration,
          ...reqDecoded.configuration,
        },
        expiresAt: expiresAt,
        sessionId,
        accountNumber,
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
        meta.responseSuccess.status
      );
    } catch (e) {
      return handleError(log, e);
    }
  },
};
