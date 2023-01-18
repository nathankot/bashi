import * as t from "io-ts";

import {
  CommandSet,
  Commands,
  BuiltinCommandDefinition,
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
  clarification: t.type({
    question: t.string,
    answer: t.string,
  }),
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
  clarificationQuestion: t.string,
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

const privateCommands = {
  clarify: {
    description:
      "ask more information necessary to interpret the request, " +
      "must not be used with other functions",
    args: [{ name: "question for missing information", type: "string" }],
  } as BuiltinCommandDefinition<["string"]>,
};

export async function run(
  modelDeps: ModelDeps,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  let log = modelDeps.log;

  if (
    !(
      "request" in input ||
      "requestContext" in input ||
      "clarification" in input
    )
  ) {
    throw new HTTPError(
      `at least one of 'request', 'requestContext' or 'clarification' must be populated`,
      400
    );
  }

  const pendingRequest =
    input.request != null ? null : modelDeps.session.pendingAssistRequest;

  const requestContext: RequestContext = {
    ...pendingRequest?.requestContext,
    ...input.requestContext,
  };

  const clarifications: { question: string; answer: string }[] = [
    ...(pendingRequest?.clarifications ?? []),
    ...(input.clarification != null ? [input.clarification] : []),
  ];

  let request = input.request ?? pendingRequest?.request;

  if (request == null) {
    throw new HTTPError(
      "no request could be found, either in the 'request' field, " +
        " or in a pending request",
      400
    );
  }

  if (
    pendingRequest != null &&
    clarifications.length === 0 &&
    Object.keys(requestContext).length === 0
  ) {
    throw new HTTPError(
      "additional information must be provided in the 'requestContext' or " +
        " 'clarification' fields in order to proceed with the previous request",
      400
    );
  }

  // by default we want to clear the pending request if any:
  modelDeps.setUpdatedSession({
    ...modelDeps.session,
    pendingAssistRequest: undefined,
  });

  let commands = await (async (): Promise<Commands> => {
    // we can re-use the previously stored commands as long as there were
    // no clarifications added to this request:
    if (input.clarification == null && pendingRequest != null) {
      return pendingRequest.commands;
    }

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
      ...privateCommands,
    });

    const prompt = makePrompt(commandSet, clarifications, request.trim());

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

    return parseFromModelResult(
      {
        log,
        now: modelDeps.now(),
        knownCommands: commandSet,
        sessionConfiguration: modelDeps.session.configuration,
      },
      text
    );
  })();

  const pendingAssistRequest = {
    clarifications,
    requestContext,
    commands,
    request,
  };

  // Return if the model indicates that any clarifications are needed:
  const clarificationQuestion = commands
    .map((command) => {
      if (command.type === "parsed" && command.name == "clarify") {
        const arg = command.args[0];
        if (arg != null && arg.type === "string") {
          return arg.value;
        }
      }
      return null;
    })
    .filter((c) => c != null)[0];

  if (clarificationQuestion != null) {
    modelDeps.setUpdatedSession({
      ...modelDeps.session,
      pendingAssistRequest,
    });
    return {
      model: "assist-000",
      request: input.request ?? "",
      result: {
        type: "needs_clarification",
        clarificationQuestion,
      },
    };
  }

  // Check interceptors have the request context that they need:
  let missingRequestContext: null | RequestContextRequirement = null;
  const commandNames = commands.reduce(
    (a: Record<string, null>, c) =>
      c.type !== "parsed" ? a : { ...a, [c.name]: null },
    {}
  );
  for (const interceptor of Object.values(commandInterceptors)) {
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
      pendingAssistRequest,
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

  let okResult: Output = {
    model: "assist-000",
    request,
    result: {
      type: "ok",
      commands,
    },
  };

  // Run all of the command interceptors:
  for (const interceptor of Object.values(commandInterceptors)) {
    const interceptedOutput = await modelDeps.faultHandlingPolicy.execute(
      async ({ signal }) =>
        interceptor.interceptor(
          "assist-000",
          { ...modelDeps, signal },
          input,
          okResult
        )
    );
    if ("missingRequestContext" in interceptedOutput) {
      throw new Error(
        `command intercepts must not return missingRequestContext - this should happen at the validation step`
      );
    }
    okResult = interceptedOutput;
  }

  return okResult;
}

function makePrompt(
  commands: CommandSet,
  clarifications: { question: string; answer: string }[],
  request: string
): string {
  const commandSet = makeCommandSet(commands);

  return `Interpret requests intended for a voice assistant.

For each request respond with an ordered list of known function calls separated by newlines, identifying what would need to happen in order to fulfill the request.

The known functions are as follows, denoted in a Typescript-like function definition notation. When responding, string arguments MUST be quoted and any quotes inside them MUST be escaped. Each function call MUST have the exact number of arguments specified. Functions other than the ones listed below MUST NOT be used. Function arguments MUST be literal types and MUST NOT be nested.

${commandSet.join("\n")}

For example, if the request is "Whats the time in Los Angeles?", respond with:

time("America/Los_Angeles")
display()

If the request could not be understood, use the fail() command to indicate why or what might be missing from the request. Aim to use the minimal number of commands to satisfy the request.

The request is:

${request}

${
  clarifications.length === 0
    ? ""
    : `The provided clarifications are:\n${clarifications
        .map((c) => `Q: ${c.question}\nA: ${c.answer}`)
        .join("\n\n")}`
}

Begin!`;
}

function makeCommandSet(commands: CommandSet): string[] {
  return Object.entries(commands).map(([name, c]) => {
    const args = c.args.map((a) => `${a.name}: ${a.type}`);
    return `\`${name}(${args.join(", ")})\` - ${c.description}`;
  });
}
