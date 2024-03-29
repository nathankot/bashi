import * as t from "io-ts";

import { ModelDeps } from "./modelDeps.ts";

export const Name = t.literal("code-000");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.type({
  programmingLanguage: t.string,
  request: t.string,
});
export type Input = t.TypeOf<typeof Input>;

export const Output = t.type({
  model: Name,
  programmingLanguage: t.string,
  request: t.string,
  result: t.string,
});
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model: "code-000",
};

export async function run(
  deps: ModelDeps,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  const prompt = makePrompt(
    input.programmingLanguage.trim(),
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
    model: "code-000",
    programmingLanguage: input.programmingLanguage,
    request: input.request,
    result,
  };
}

function makePrompt(targetLanguage: string, request: string): string {
  return `Generate code in the language ${targetLanguage}, which satisfies the following description/requirement:\n${request}\n\nBegin!\n`;
}
