import * as f from "fp-ts";

import { Handlers } from "$fresh/server.ts";

import { renderError, renderJSON } from "@lib/util.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";
import { State } from "./_middleware.ts";
import { models, Input, Output, getConfiguration } from "@lib/models/mod.ts";

export type PostRequestsRequest = Input;
export type PostRequestsResponse = Output;

export const handler: Handlers<Output, State & ApiState> = {
  async POST(req, ctx) {
    let json;
    try {
      json = await req.json();
    } catch {
      return renderError(400, "could not parse json");
    }

    const inputDecodeResult = Input.decode(json);
    if (!f.either.isRight(inputDecodeResult)) {
      return renderError(400, "malformed request");
    }

    const input: Input = inputDecodeResult.right as any;
    const modelDeps = { openai: ctx.state.clients.openai };
    const modelName = input.model;

    try {
      switch (modelName) {
        case "assist-davinci-003":
          const configuration = getConfiguration(modelName, ctx.state.session);
          if (configuration == null) {
            return renderError(
              400,
              `the model '${modelName}' has not been configured`
            );
          }
          return renderJSON(
            await models[modelName].run(modelDeps, configuration, input)
          );

        case "noop":
          return renderJSON(
            await models[modelName].run(modelDeps, { model: "noop" }, input)
          );

        default:
          const exhaustiveCheck: never = modelName;
          throw new Error(`internal error, ${exhaustiveCheck} not found`);
      }
    } catch (e) {
      console.error("could not communicated with openai", e);
      return renderError(500, "internal server error");
    }
  },
};
