import * as f from "fp-ts";

import { Handlers } from "$fresh/server.ts";

import { renderError, renderJSON, handleError } from "@lib/util.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";
import { State } from "./_middleware.ts";
import { Input, Output, run } from "@lib/models.ts";

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
    const modelDeps = { openai: ctx.state.clients.openai, log: ctx.state.log };
    const modelName = input.model;

    try {
      switch (modelName) {
        case "assist-davinci-003":
        case "translate-davinci-003":
        case "noop":
          return renderJSON(
            await run(modelDeps, ctx.state.session, modelName, input)
          );

        default:
          const exhaustiveCheck: never = modelName;
          throw new Error(`model ${exhaustiveCheck} not found`);
      }
    } catch (e) {
      ctx.state.log("error", e);
      return handleError(e);
    }
  },
};
