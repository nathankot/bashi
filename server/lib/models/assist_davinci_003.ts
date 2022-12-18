import * as t from "io-ts";

import { ModelDeps } from "@lib/model_deps.ts";
import { Configuration as SessionConfiguration } from "@lib/session/configuration.ts";
import {
  FunctionSet,
  FunctionCalls,
  parseFromModelResult,
  builtinFunctions,
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
  sessionConfiguration: SessionConfiguration,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  const request = input.request.trim();
  const functionsSet = { ...configuration.functions, ...builtinFunctions };
  const prompt = makePrompt(functionsSet, request);

  const completion = await deps.openai.createCompletion({
    model: "text-davinci-003",
    max_tokens: 1000, // TODO return error if completion tokens has reached this limit
    best_of: 1,
    echo: false,
    prompt: [prompt],
  });

  const text = completion.data.choices[0]?.text ?? "";

  return {
    model: "assist-davinci-003",
    request,
    functionCalls: parseFromModelResult(functionsSet, text),
  };
}

function makePrompt(functions: FunctionSet, request: string): string {
  const functionsList = makeFunctionSet(functions);

  return `You are a voice assistant capable of interpreting requests.

For each request respond with an interpretation. An interpretation is composed of one or more lines of function calls separated by newlines identifying what would need to happen in order to fulfill the request. ONLY use function calls that are referenced below.

The available functions are as follows, denoted in typescript function notation. When responding make sure that any quotes inside function string arguments are escaped.

${functionsList.join("\n")}

For example, if the request is \`whats the time in Los Angeles\` respond with:

\`\`\`
time("America/Los_Angeles")
\`\`\`

If no interpretation is found, use the respond() function to ask for information that might be missing from the
request. Or as a last resort, respond() that the request is not supported.

The request is:

\`\`\`
${request}
\`\`\`

Write your response below:`;
}

function makeFunctionSet(functions: FunctionSet): string[] {
  return Object.entries(functions).map(([name, c]) => {
    const args = c.args.map((a) => `${a.name}: ${a.type}`);
    return `\`${name}(${args.join(", ")})\` - ${c.description}`;
  });
}
