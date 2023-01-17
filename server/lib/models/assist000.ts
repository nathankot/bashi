import * as t from "io-ts";

import {
  CommandSet,
  Commands,
  parseFromModelResult,
  builtinCommands,
  filterUnnecessary,
  commandInterceptors,
} from "@lib/command.ts";

import { HTTPError } from "@lib/errors.ts";
import {
  RequestContext,
  RequestContextRequirement,
} from "@lib/requestContext.ts";
import { wrap } from "@lib/log.ts";

import { ModelDeps } from "./modelDeps.ts";

export const Name = t.literal("assist-000");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
  commands: CommandSet,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.partial({
  request: t.string,
  requestContext: RequestContext,
});
export type Input = t.TypeOf<typeof Input>;

export const ResultOK = t.type({
  type: t.literal("ok"),
  commands: Commands,
});

export const ResultNeedsRequestContext = t.type({
  type: t.literal("needs_request_context"),
  missingRequestContext: RequestContextRequirement,
});

export const ResultNeedsClarification = t.type({
  type: t.literal("needs_clarification"),
  clarificationRequest: t.string,
});

export const Result = t.union([
  ResultOK,
  ResultNeedsRequestContext,
  ResultNeedsClarification,
]);

export const Output = t.type({
  model: Name,
  request: t.string,
  result: Result,
});
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
    Exclude<Output, { missingRequestContext: RequestContextRequirement }>
  > => {
    if (!("request" in input) || input.request == null) {
      const outputAwaitingContext = modelDeps.session.outputAwaitingContext;
      // if there is no request field, then we assume missing request context is being fulfilled:
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
    const enabledBuiltinCommands: Partial<typeof builtinCommands> =
      modelDeps.session.configuration.enabledBuiltinCommands.reduce(
        (a, enabledCommand) =>
          builtinCommands[enabledCommand] == null
            ? a
            : {
                ...a,
                [enabledCommand]: builtinCommands[enabledCommand],
              },
        {}
      );

    const commandSet = filterUnnecessary(request, {
      ...configuration.commands,
      ...enabledBuiltinCommands,
    });
    const prompt = makePrompt(commandSet, request);

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

    const commands = parseFromModelResult(
      {
        log,
        now: modelDeps.now(),
        knownCommands: commandSet,
        sessionConfiguration: modelDeps.session.configuration,
      },
      text
    );

    return {
      model: "assist-000",
      request,
      result: {
        type: "ok",
        commands,
      },
    };
  })();

  // No need for further processing if we are not at an 'ok' result at this stage:
  if (output.result.type !== "ok") {
    return output;
  }

  // First ensure that all interceptors have the request context that they need:
  let missingRequestContext: null | RequestContextRequirement = null;
  const commands = output.result.commands;
  const commandNames = commands.reduce(
    (a: Record<string, null>, c) =>
      c.type !== "parsed" ? a : { ...a, [c.name]: null },
    {}
  );
  for (const interceptor of commandInterceptors) {
    if (!(interceptor.commandName in commandNames)) {
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
      result: {
        type: "needs_request_context",
        missingRequestContext,
      },
    };
  }

  // Then run all of the command interceptors:
  for (const interceptor of commandInterceptors) {
    const interceptedOutput = await modelDeps.faultHandlingPolicy.execute(
      async ({ signal }) =>
        interceptor.interceptor({ ...modelDeps, signal }, input, output)
    );
    if ("missingRequestContext" in interceptedOutput) {
      throw new Error(
        `command intercepts must not return missinGrequestContext - this should happen at the validation step`
      );
    }
    output = interceptedOutput;
  }

  return output;
}

function makePrompt(commands: CommandSet, request: string): string {
  const commandSet = makeCommandSet(commands);

  return `Your role is to interpret requests intended for a voice assistant.

For each request respond with an ordered list of known function calls separated by newlines, identifying what would need to happen in order to fulfill the request.

The known functions are as follows, denoted in a Typescript-like function definition notation. When responding, string arguments MUST be quoted and any quotes inside them MUST be escaped. Each function call MUST have the exact number of arguments specified. Functions other than the ones listed below MUST NOT be used. Function arguments MUST be literal types and MUST NOT be nested.

${commandSet.join("\n")}

For example, if the request is "Whats the time in Los Angeles?", respond with:

time("America/Los_Angeles")
display()

If the request could not be understood, use the fail() command to indicate why or what might be missing from the request. Aim to use the minimal number of commands to satisfy the request.

The request is:

${request}

Your interpreted instructions are:`;
}

function makeCommandSet(commands: CommandSet): string[] {
  return Object.entries(commands).map(([name, c]) => {
    const args = c.args.map((a) => `${a.name}: ${a.type}`);
    return `\`${name}(${args.join(", ")})\` - ${c.description}`;
  });
}
