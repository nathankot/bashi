import * as t from "io-ts";

import { ModelDeps } from "./model_deps.ts";

export const Name = t.literal("code-davinci-003");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.type({
  model: Name,
  targetLanguage: t.string,
  whatIsBeingGenerated: t.string,
  request: t.string,
});
export type Input = t.TypeOf<typeof Input>;

export const Output = t.type({
  model: Name,
  targetLanguage: t.string,
  request: t.string,
  result: t.string,
});
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model: "code-davinci-003",
};

export async function run(
  deps: ModelDeps,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  const prompt = makePrompt(
    input.targetLanguage.trim(),
    input.whatIsBeingGenerated.trim(),
    input.request.trim()
  );
  const completion = await deps.openai.createCompletion(
    {
      model: "text-davinci-003",
      max_tokens: deps.session.configuration.maxResponseTokens, // TODO return error if completion tokens has reached this limit
      best_of: deps.session.configuration.bestOf,
      echo: false,
      prompt: [prompt],
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

  return {
    model: "code-davinci-003",
    targetLanguage: input.targetLanguage,
    request: input.request,
    result,
  };
}

function makePrompt(
  targetLanguage: string,
  whatIsBeingGenerated: string,
  request: string
): string {
  return `Generate a ${targetLanguage} ${whatIsBeingGenerated} to ${request}:
`;
}
