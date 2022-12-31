import * as t from "io-ts";
import { OpenAPIV3 } from "openapi-types";

import { HTTPError } from "@lib/errors.ts";

import { ModelDeps } from "./modelDeps.ts";

const model = "whisper-000";

export const Name = t.literal(model);
export type Name = t.TypeOf<typeof Name>;
export const Configuration = t.type({ model: t.literal(model) });
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.type({
  audioArrayBuffer: t.any,
});
export type Input = t.TypeOf<typeof Input> & {
  audioArrayBuffer: ArrayBuffer;
};

export const Output = t.type({
  model: t.literal(model),
  transcribed: t.string,
});
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model,
};

export const customRequestHandler = {
  openAPIRequestBody: {
    description: "audio data in a conatiner format supported by ffmpeg",
    content: {
      "audio/*": {
        schema: {
          type: "string",
          format: "binary",
        },
      },
    },
  } satisfies OpenAPIV3.RequestBodyObject,

  parseRequest: async (req: Request): Promise<Input> => {
    const audioArrayBuffer = await req.arrayBuffer();
    if (audioArrayBuffer == null) {
      throw new HTTPError("no audio found in the request body", 400);
    }
    return {
      audioArrayBuffer,
    };
  },
};

export async function run(
  deps: ModelDeps,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  const whisperEndpoint = deps.whisperEndpoint;

  if (!(input.audioArrayBuffer instanceof ArrayBuffer)) {
    throw new Error("expected an ArrayBuffer");
  }

  const whisperRequest = new FormData();
  whisperRequest.append(
    "audio_file",
    new Blob([input.audioArrayBuffer]),
    "audio_file"
  );
  const whisperResponse = await fetch(whisperEndpoint + "?language=en", {
    method: "POST",
    body: whisperRequest,
    signal: deps.signal,
  });
  const whisperBody = await whisperResponse.json();
  const transcribed = whisperBody.text;
  if (typeof transcribed !== "string") {
    deps.log("error", {
      ...whisperBody,
      message: "failed to transcribe",
    });
    throw new Error("expected whisper response body to be string");
  }

  return {
    model,
    transcribed,
  };
}
