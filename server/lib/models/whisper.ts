import * as t from "io-ts";

import { ModelDeps } from "./model_deps.ts";
import { Configuration as SessionConfiguration } from "@lib/session/configuration.ts";

const model = "whisper";

export const Name = t.literal(model);
export type Name = t.TypeOf<typeof Name>;
export const Configuration = t.type({ model: t.literal(model) });
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.type({
  model: t.literal(model),
  arrayBuffer: t.any,
});
export type Input = t.TypeOf<typeof Input> & { arrayBuffer: ArrayBuffer };

export const Output = t.type({
  model: t.literal(model),
  transcribed: t.string,
});
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model,
};

export async function run(
  deps: ModelDeps,
  sessionConfiguration: SessionConfiguration,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  const whisperEndpoint = deps.whisperEndpoint;

  if (!(input.arrayBuffer instanceof ArrayBuffer)) {
    throw new Error("expected an ArrayBuffer");
  }

  const whisperRequest = new FormData();
  whisperRequest.append(
    "audio_file",
    new Blob([input.arrayBuffer]),
    "audio_file"
  );
  const whisperResponse = await fetch(whisperEndpoint + "?language=en", {
    method: "POST",
    body: whisperRequest,
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
