import * as f from "fp-ts";

import { Handlers } from "$fresh/server.ts";

import HTTPError from "@lib/http_error.ts";
import { renderError, renderJSON, handleError } from "@lib/util.ts";
import { wrap } from "@lib/log.ts";
import { defaultPolicy } from "@lib/faultHandling.ts";
import {
  AllInput,
  AllOutput,
  ModelName,
  InputFor,
  ModelDeps,
  run,
} from "@lib/models.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";
import { State } from "../_middleware.ts";

export type Request = FormData | Omit<AllInput, "model">;

export const handler: Handlers<AllOutput, State & ApiState> = {
  async POST(req, ctx) {
    let log = ctx.state.log;

    const modelNameDecodeResult = ModelName.decode(ctx.params["modelName"]);
    if (!f.either.isRight(modelNameDecodeResult)) {
      return handleError(log, new HTTPError(`model name invalid`, 400));
    }
    const model: ModelName = modelNameDecodeResult.right as any;
    log = wrap({ model }, ctx.state.log);

    const modelDeps: Omit<ModelDeps, "signal"> = {
      log,
      openai: ctx.state.clients.openai,
      whisperEndpoint: ctx.state.clients.whisperEndpoint,
      session: ctx.state.session,
      now: ctx.state.now,
      faultHandlingPolicy: defaultPolicy,
    };

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

          return renderJSON(await run(modelDeps, model, arrayBufferInput));

        case "assist-000":
        case "translate-davinci-003":
        case "code-000":
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

          if (
            "request" in requestInput &&
            requestInput.request.trim().length === 0
          ) {
            return renderError(400, "request must not be empty");
          }

          return renderJSON(await run(modelDeps, model, requestInput));

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
