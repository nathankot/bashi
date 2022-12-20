import * as t from "io-ts";

import { ModelDeps } from "./model_deps.ts";

import {
  FunctionSet,
  FunctionCalls,
  parseFromModelResult,
  builtinFunctions,
  filterUnnecessary,
} from "@lib/function.ts";

export const Name = t.literal("assist-davinci-003");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
  functions: FunctionSet,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.type({
  model: Name,
  request: t.string,
});
export type Input = t.TypeOf<typeof Input>;

export const Output = t.type({
  model: Name,
  request: t.string,
  functionCalls: FunctionCalls,
});
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model: "assist-davinci-003",
};

export async function run(
  deps: ModelDeps,
  configuration: Configuration,
  input: Input
  // todo inject abort signal
): Promise<Output> {
  const request = input.request.trim();
  const functionsSet = filterUnnecessary(request, {
    ...configuration.functions,
    ...builtinFunctions,
  });
  const prompt = makePrompt(functionsSet, request);

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

  const text = completion.data.choices[0]?.text ?? "";

  return {
    model: "assist-davinci-003",
    request,
    functionCalls: parseFromModelResult(
      { log: deps.log, now: deps.now(), knownFunctions: functionsSet },
      text
    ),
  };
}

function makePrompt(functions: FunctionSet, request: string): string {
  const functionSet = makeFunctionSet(functions);

  return `You are a voice assistant capable of interpreting requests.

For each request respond with an interpretation. An interpretation is composed of one or more lines of ordered function calls separated by newlines identifying what would need to happen in order to fulfill the request. ONLY use function calls that are referenced below.

The available functions are as follows, denoted in a Typescript-like function notation. When responding, string arguments MUST be quoted and any quotes inside them MUST be escaped.

${functionSet.join("\n")}

For example, if the request is "Whats the time in Los Angeles?", respond with:

time("America/Los_Angeles")
say()

If the request cannot be understood, use a single ask() function to ask for information that might be missing from the request.
Aim to use the minimal number of functions to satisfy the request.
As a last resort, use notSupported() to indicate that the request is not supported.

The request is:

${request}

Write your response below:`;
}

function makeFunctionSet(functions: FunctionSet): string[] {
  return Object.entries(functions).map(([name, c]) => {
    const args = c.args.map((a) => `${a.name}: ${a.type}`);
    return `\`${name}(${args.join(", ")})\` - ${c.description}`;
  });
}
