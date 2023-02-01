import * as t from "io-ts";

import { ModelDeps } from "./modelDeps.ts";
import { IS_DEV } from "@lib/constants.ts";

const model = "passthrough-openai-000";

export const Name = t.literal(model);
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.type({
  openAiModel: t.string,
  request: t.string,
});
export type Input = t.TypeOf<typeof Input>;

export const Output = t.type({
  model: Name,
  openAiModel: t.string,
  request: t.string,
  result: t.string,
});
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model,
};

export async function run(
  deps: ModelDeps,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  if (IS_DEV()) {
    deps.log("info", `passthrough model prompt: ${input.request}`);
  }
  const completion = await deps.openai.createCompletion(
    {
      model: input.openAiModel,
      max_tokens: deps.session.configuration.maxResponseTokens, // TODO return error if completion tokens has reached this limit
      best_of: deps.session.configuration.bestOf,
      echo: false,
      prompt: [input.request],
    },
    {
      signal: deps.signal,
    }
  );

  deps.log("info", {
    message: "tokens used",
    total_tokens: completion.data.usage?.total_tokens,
  });

  const result = completion.data.choices[0]?.text ?? "";
  deps.log("info", `passthrough model result: ${result}`);

  return {
    model,
    result,
    request: input.request,
    openAiModel: input.openAiModel,
  };
}
