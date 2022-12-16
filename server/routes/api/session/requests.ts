import * as t from "io-ts";
import * as f from "fp-ts";

import { Handlers } from "$fresh/server.ts";

import { renderError, renderJSON } from "@lib/util.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";
import { State } from "./_middleware.ts";
import { models, Input, Output } from "@lib/models/mod.ts";

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
    const modelName = input.model;
    const model = models[modelName];

    let configuration: null | t.TypeOf<typeof model.Configuration> = null;
    for (const conf of ctx.state.session.modelConfigurations) {
      if (conf.model === modelName) {
        configuration = conf;
      }
    }

    if (configuration == null) {
      return renderError(
        400,
        `the model '${modelName}' has not been configured`
      );
    }

    try {
      const result = await model.run(
        { openai: ctx.state.clients.openai },
        configuration as any,
        input as any
      );

      return renderJSON(result);
    } catch (e) {
      console.error("could not communicated with openai", e);
      return renderError(500, "internal server error");
    }
  },
};
