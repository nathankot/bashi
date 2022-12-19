import * as t from "io-ts";

import { ModelDeps } from "@lib/model_deps.ts";
import { Configuration as SessionConfiguration } from "@lib/session/configuration.ts";

export const Name = t.literal("translate-davinci-003");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.type({
  model: Name,
  targetLanguage: t.string,
  request: t.string,
});
export type Input = t.TypeOf<typeof Input>;

export const Output = t.type({
  model: Name,
  request: t.string,
  result: t.string,
});
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model: "translate-davinci-003",
};

export async function run(
  deps: ModelDeps,
  sessionConfiguration: SessionConfiguration,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  const request = input.request.trim();
  const prompt = makePrompt(input.targetLanguage, request);
  const completion = await deps.openai.createCompletion({
    model: "text-davinci-003",
    max_tokens: sessionConfiguration.maxResponseTokens, // TODO return error if completion tokens has reached this limit
    best_of: sessionConfiguration.bestOf,
    echo: false,
    prompt: [prompt],
  });

  deps.log("info", {
    message: "tokens used",
    total_tokens: completion.data.usage?.total_tokens,
  });

  const result = completion.data.choices[0]?.text ?? "";

  return {
    model: "translate-davinci-003",
    request,
    result,
  };
}

function makePrompt(targetLanguage: string, request: string): string {
  return `Translate this into ${targetLanguage}:\n${request}`;
}
