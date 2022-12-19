import * as f from "fp-ts";

import { Handlers } from "$fresh/server.ts";

import HTTPError from "@lib/http_error.ts";
import { renderError, renderJSON, handleError } from "@lib/util.ts";
import { wrap } from "@lib/log.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";
import { AllInput, AllOutput, ModelName, InputFor, run } from "@lib/models.ts";
import { State } from "../_middleware.ts";

export type Request = FormData | Omit<AllInput, "model">;

export const handler: Handlers<AllOutput, State & ApiState> = {
  async POST(req, ctx) {
    const modelNameDecodeResult = ModelName.decode(ctx.params["modelName"]);
    if (!f.either.isRight(modelNameDecodeResult)) {
      return handleError(new HTTPError(`model name invalid`, 400));
    }
    const model: ModelName = modelNameDecodeResult.right as any;

    const modelDeps = {
      openai: ctx.state.clients.openai,
      log: ctx.state.log,
      whisperEndpoint: ctx.state.clients.whisperEndpoint,
    };

    const log = wrap({ model }, ctx.state.log);

    try {
      switch (model) {
        case "whisper":
          const arrayBuffer = await req.arrayBuffer();
          if (arrayBuffer == null) {
            return renderError(400, "no audio found in the request body");
          }
          const arrayBufferInput: InputFor<typeof model> = {
            model,
            arrayBuffer,
          };

          return renderJSON(
            await run(modelDeps, ctx.state.session, model, arrayBufferInput)
          );

        case "assist-davinci-003":
        case "translate-davinci-003":
        case "noop":
          // JSON request
          let json;
          try {
            json = await req.json();
          } catch {
            return renderError(400, "could not parse json");
          }

          const inputDecodeResult = AllInput.decode({ model, ...json });
          if (!f.either.isRight(inputDecodeResult)) {
            return renderError(400, "malformed request");
          }

          const requestInput: InputFor<typeof model> =
            inputDecodeResult.right as any;

          return renderJSON(
            await run(modelDeps, ctx.state.session, model, requestInput)
          );

        default:
          const exhaustiveCheck: never = model;
          throw new Error(`model ${exhaustiveCheck} not found`);
      }
    } catch (e) {
      log("error", e);
      return handleError(e);
    }
  },
};
