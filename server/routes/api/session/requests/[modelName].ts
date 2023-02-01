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
  ModelDeps,
  run,
  models,
} from "@lib/models.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";
import { State } from "../_middleware.ts";

export const meta = {} as Record<ModelName, OpenAPIV3.PathItemObject>;

for (const modelName of Object.keys(models) as ModelName[]) {
  const model = models[modelName];

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
      requestBody:
        "customRequestHandler" in model
          ? model.customRequestHandler.openAPIRequestBody
          : {
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

    const modelName = ctx.params["modelName"];
    if (!ModelName.is(modelName)) {
      return handleError(log, new HTTPError(`model name invalid`, 400));
    }
    log = wrap({ modelName }, ctx.state.log);

    const modelDeps: Omit<ModelDeps, "signal"> = {
      log,
      googleSearch: ctx.state.clients.googleSearch,
      openai: ctx.state.clients.openai,
      whisperEndpoint: ctx.state.clients.whisperEndpoint,
      session: ctx.state.session,
      now: ctx.state.now,
      faultHandlingPolicy: defaultPolicy,
      setUpdatedSession: (newSession) =>
        (ctx.state.updatedSession = newSession),
    };

    try {
      const model = models[modelName];

      let input: AllInput;

      if ("customRequestHandler" in model) {
        input = await model.customRequestHandler.parseRequest(req);
      } else {
        let json;
        try {
          json = await req.json();
        } catch {
          return renderError(400, "could not parse json");
        }
        input = { model: modelName, ...json };
      }

      if (!model.Input.is(input)) {
        return renderError(400, "malformed request");
      }

      if ("request" in input && (input.request ?? "").trim().length === 0) {
        return renderError(400, "request must not be empty");
      }

      return renderJSON(await run(modelDeps, modelName, input));
    } catch (e) {
      log("error", e);
      return handleError(log, e);
    }
  },
};
