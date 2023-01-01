import * as t from "io-ts";

import {
  FunctionSet,
  FunctionCalls,
  parseFromModelResult,
  builtinFunctions,
  filterUnnecessary,
  functionCallInterceptors,
} from "@lib/function.ts";

import { HTTPError } from "@lib/errors.ts";
import { RequestContext, RequestContextDef } from "@lib/requestContext.ts";
import { wrap } from "@lib/log.ts";

import { ModelDeps } from "./modelDeps.ts";

export const Name = t.literal("assist-000");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
  functions: FunctionSet,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.partial({
  request: t.string,
  requestContext: RequestContext,
});
export type Input = t.TypeOf<typeof Input>;

export const Output = t.intersection([
  t.type({
    model: Name,
    request: t.string,
    functionCalls: FunctionCalls,
  }),
  t.partial({
    missingRequestContext: RequestContextDef,
  }),
]);
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model: "assist-000",
};

export async function run(
  modelDeps: ModelDeps,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  let log = modelDeps.log;

  if (!("request" in input || "requestContext" in input)) {
    throw new HTTPError(
      `at least one of 'request' or 'requestContext' must be populated`,
      400
    );
  }

  const requestContext: RequestContext = !("requestContext" in input)
    ? {}
    : input.requestContext == null
    ? {}
    : input.requestContext;

  let output = await (async (): Promise<
    Exclude<Output, { missingRequestContext: RequestContextDef }>
  > => {
    if (!("request" in input) || input.request == null) {
      const outputAwaitingContext = modelDeps.session.outputAwaitingContext;
      // we assume missing request context is being fulfilled:
      if (outputAwaitingContext == null) {
        throw new HTTPError(
          "the request field it not populated, " +
            "but no pending request awaiting context found",
          400
        );
      }
      if (!Output.is(outputAwaitingContext)) {
        throw new HTTPError(
          "pending request awaiting context was for a different model",
          400
        );
      }
      if ("missingRequestContext" in outputAwaitingContext) {
        throw new Error(
          `key "missingRequestContext" unexpectedly found in stored output`
        );
      }
      modelDeps.setUpdatedSession({
        ...modelDeps.session,
        outputAwaitingContext: undefined,
      });
      return outputAwaitingContext;
    }

    const request = input.request.trim();
    const filteredBuiltinFunctions: Partial<typeof builtinFunctions> = {
      ...builtinFunctions,
    };
    for (const disabledFn of modelDeps.session.configuration
      .disabledBuiltinFunctions) {
      delete filteredBuiltinFunctions[disabledFn];
    }
    const functionsSet = filterUnnecessary(request, {
      ...configuration.functions,
      ...filteredBuiltinFunctions,
    });
    const prompt = makePrompt(functionsSet, request);

    const completion = await modelDeps.openai.createCompletion(
      {
        model: "text-davinci-003",
        max_tokens: modelDeps.session.configuration.maxResponseTokens, // TODO return error if completion tokens has reached this limit
        best_of: modelDeps.session.configuration.bestOf,
        echo: false,
        prompt: [prompt],
      },
      {
        signal: modelDeps.signal,
      }
    );

    log = wrap({ total_tokens: completion.data.usage?.total_tokens }, log);
    log("info", { message: "tokens used" });

    const text = completion.data.choices[0]?.text ?? "";

    const functionCalls = parseFromModelResult(
      {
        log,
        now: modelDeps.now(),
        knownFunctions: functionsSet,
      },
      text
    );

    return {
      model: "assist-000",
      request,
      functionCalls,
    };
  })();

  const functionCalls = output.functionCalls;

  const fnNames = functionCalls.reduce(
    (a: Record<string, null>, c) =>
      c.type !== "parsed" ? a : { ...a, [c.name]: null },
    {}
  );

  let missingRequestContext: null | RequestContextDef = null;
  // First ensure that all interceptors have the request context that they need:
  for (const interceptor of functionCallInterceptors) {
    if (!(interceptor.fnName in fnNames)) {
      continue;
    }
    const validateResult = await interceptor.validateRequestContext(
      requestContext
    );
    if (validateResult === true) {
      continue;
    }
    missingRequestContext = {
      ...(missingRequestContext ?? {}),
      ...validateResult,
    };
  }

  // If we have request context that is missing, update session state to
  // keep track of what we have so far, and let the user know.
  if (missingRequestContext != null) {
    modelDeps.setUpdatedSession({
      ...modelDeps.session,
      outputAwaitingContext: output,
    });
    return {
      model: "assist-000",
      request: input.request ?? "",
      functionCalls: [],
      missingRequestContext,
    };
  }

  // Then run all of the function call interceptors:
  for (const interceptor of functionCallInterceptors) {
    const interceptedOutput = await modelDeps.faultHandlingPolicy.execute(
      async ({ signal }) =>
        interceptor.interceptor({ ...modelDeps, signal }, input, output)
    );
    if ("missingRequestContext" in interceptedOutput) {
      throw new Error(
        `function intercepts must not return missinGrequestContext - this should happen at the validation step`
      );
    }
    output = interceptedOutput;
  }

  return output;
}

function makePrompt(functions: FunctionSet, request: string): string {
  const functionSet = makeFunctionSet(functions);

  return `You are a voice assistant capable of interpreting requests.

For each request respond with one or more lines of ordered function calls separated by newlines identifying what would need to happen in order to fulfill the request.

The available functions are as follows, denoted in a Typescript-like function notation. When responding, string arguments MUST be quoted and any quotes inside them MUST be escaped. Each function call MUST have the exact number of arguments specified. And ONLY functions specified below may be used. Function arguments must be literal types and cannot be nested.

${functionSet.join("\n")}

For example, if the request is "Whats the time in Los Angeles?", respond with:

time("America/Los_Angeles")
flushToSpeech()

If the request could not be understood, use the fail() function to indicate why or what might be missing from the request. Aim to use the minimal number of functions to satisfy the request.

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
