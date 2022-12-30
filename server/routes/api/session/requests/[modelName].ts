import * as t from "io-ts";

import { Handlers } from "$fresh/server.ts";
import { OpenAPIV3 } from "openapi-types";

import { HTTPError } from "@lib/errors.ts";
import { renderError, renderJSON, handleError } from "@lib/util.ts";
import { wrap } from "@lib/log.ts";
import { defaultPolicy } from "@lib/faultHandling.ts";
import toJSONSchema from "@lib/toJsonSchema.ts";
import {
  AllInput,
  AllOutput,
  ModelName,
  InputFor,
  ModelDeps,
  run,
  models,
} from "@lib/models.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";
import { State } from "../_middleware.ts";

// Note the following does not specify the binary audio/* request:
export const POSTRequest = AllInput;
export type POSTRequest = t.TypeOf<typeof POSTRequest>;

export const POSTResponse = AllOutput;
export type POSTResponse = t.TypeOf<typeof POSTResponse>;

export const meta = {} as Record<ModelName, OpenAPIV3.PathItemObject>;

for (const modelName of Object.keys(models) as ModelName[]) {
  meta[modelName] = {
    post: {
      operationId: "post_session_" + modelName,
      summary: "TODO",
      description: "TODO",
      security: [{ account_number: [] }],
      parameters: [
        {
          $ref: "#/components/parameters/session_id",
        },
      ],
      requestBody: {
        description: "TODO",
        content: {
          "application/json": {
            schema: toJSONSchema(models[modelName].Input),
            // TODO
            // example: {}
          },
        },
      },
      responses: {
        "200": {
          description: "TODO",
          content: {
            "application/json": {
              schema: toJSONSchema(models[modelName].Output),
            },
          },
        },
        "400": { $ref: "#/components/responses/error" },
        "401": { $ref: "#/components/responses/error" },
        "403": { $ref: "#/components/responses/error" },
      },
    },
  } satisfies OpenAPIV3.PathItemObject;
}

export const handler: Handlers<AllOutput, State & ApiState> = {
  async POST(req, ctx) {
    let log = ctx.state.log;

    const model = ctx.params["modelName"];
    if (!ModelName.is(model)) {
      return handleError(log, new HTTPError(`model name invalid`, 400));
    }
    log = wrap({ model }, ctx.state.log);

    const modelDeps: Omit<ModelDeps, "signal"> = {
      log,
      openai: ctx.state.clients.openai,
      whisperEndpoint: ctx.state.clients.whisperEndpoint,
      session: ctx.state.session,
      now: ctx.state.now,
      faultHandlingPolicy: defaultPolicy,
      setUpdatedSession: (newSession) =>
        (ctx.state.updatedSession = newSession),
    };

    try {
      switch (model) {
        case "whisper-000":
          const arrayBuffer = await req.arrayBuffer();
          if (arrayBuffer == null) {
            return renderError(400, "no audio found in the request body");
          }
          const arrayBufferInput: InputFor<typeof model> = {
            arrayBuffer,
          };

          return renderJSON(await run(modelDeps, model, arrayBufferInput));

        case "assist-000":
        case "translate-000":
        case "code-000":
        case "passthrough-openai-000":
        case "noop":
          // JSON request
          let json;
          try {
            json = await req.json();
          } catch {
            return renderError(400, "could not parse json");
          }

          const input = { model, ...json };
          if (!models[model].Input.is(input)) {
            return renderError(400, "malformed request");
          }

          if ("request" in input && input.request.trim().length === 0) {
            return renderError(400, "request must not be empty");
          }

          return renderJSON(await run(modelDeps, model, input));

        default:
          const exhaustiveCheck: never = model;
          throw new Error(`model ${exhaustiveCheck} not found`);
      }
    } catch (e) {
      log("error", e);
      return handleError(log, e);
    }
  },
};
