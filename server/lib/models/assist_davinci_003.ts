import * as t from "io-ts";

import { ModelDeps } from "./model_deps.ts";
import { FunctionList, FunctionCalls } from "@lib/function.ts";

export const Name = t.literal("assist-davinci-003");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
  functions: FunctionList,
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
  text: t.string,
  functionCalls: FunctionCalls,
});
export type Output = t.TypeOf<typeof Output>;

export async function run(
  deps: ModelDeps,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  const prompt = makePrompt(configuration.functions, input.request);

  const completion = await deps.openai.createCompletion({
    model: "text-davinci-003",
    max_tokens: 1000, // TODO return error if completion tokens has reached this limit
    best_of: 1,
    echo: false,
    prompt: [prompt],
  });

  return {
    model: "assist-davinci-003",
    request: input.request,
    text: completion.data.choices[0]?.text ?? "",
    functionCalls: [],
  };
}

function makePrompt(functions: FunctionList, request: string): string {
  const functionsList = makeFunctionList(functions);

  return `You are a voice assistant capable of interpreting requests.

For each request respond with an acknowledgment and a structured interpretation if identified. A structured interpretation is composed of one or more lines of function calls separated by newlines identifying what would need to happen in order to fulfill the request. You may only use function calls that are made available below.

The arailable functions are as follows, denoted in typescript function notation. When responding make sure that any quotes inside function string arguments are escaped.

${functionsList.join("\n")}

For example, if the request is \`create event for lunch with Bob tomorrow\` respond with:

\`\`\`
Understood.
calendar("tomorrow 12PM", "lunch with Bob")
\`\`\`

If no structured interpretation is found, answer the request if it is a question. Or ask for information that might be missing from the request. Or as a last resort, respond that the request is not supported.

The request is:

\`\`\`
${request}
\`\`\`

Write your response below:`;
}

function makeFunctionList(functions: FunctionList): string[] {
  return functions.map((c) => {
    const args = c.args.map((a) => `${a.name}: ${a.type}`);
    return `\`${c.name}(${args.join(", ")})\` - ${c.description}`;
  });
}
