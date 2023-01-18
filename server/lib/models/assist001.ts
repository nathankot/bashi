import * as t from "io-ts";

import {
  CommandSet,
  Commands,
  parseFromModelResult,
  builtinCommands,
  privateCommands,
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

import {
  Result,
  // ResultOK,
  // ResultNeedsClarification,
  // ResultNeedsRequestContext,
} from "./assist000.ts";

export const Name = t.literal("assist-001");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
  commands: CommandSet,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.partial({
  request: t.string,
  requestContext: RequestContext,
  clarifications: t.array(
    t.type({
      question: t.string,
      answer: t.string,
    })
  ),
});
export type Input = t.TypeOf<typeof Input>;

export const Output = t.type({
  model: Name,
  request: t.string,
  result: Result,
});
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model: "assist-001",
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
      "clarifications" in input
    )
  ) {
    throw new HTTPError(
      `at least one of 'request', 'requestContext' or 'clarifications' must be populated`,
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
    ...(input.clarifications ?? []),
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
        " 'clarifications' fields in order to proceed with the previous request",
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
    if ((input.clarifications?.length ?? 0) === 0 && pendingRequest != null) {
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
  const clarificationQuestions = commands
    .map((command) => {
      if (command.type === "parsed" && command.name == "clarify") {
        const arg = command.args[0];
        if (arg != null && arg.type === "string") {
          return arg.value;
        }
      }
      return "";
    })
    .filter((r) => r !== "");
  if (clarificationQuestions.length > 0) {
    modelDeps.setUpdatedSession({
      ...modelDeps.session,
      pendingAssistRequest,
    });
    return {
      model: "assist-001",
      request: input.request ?? "",
      result: {
        type: "needs_clarification",
        clarificationQuestions,
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
      model: "assist-001",
      request: input.request ?? "",
      result: {
        type: "needs_request_context",
        missingRequestContext,
      },
    };
  }

  let okResult: Output = {
    model: "assist-001",
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
          "assist-001",
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
  return `Answer the following questions/requests as best you can. You have access to the following tools/functions denoted in a Typescript-like definition. When used, string arguments MUST be quoted and any quotes inside them MUST be escaped. Each function call MUST have the exact number of arguments specified. Functions other than the ones listed below MUST NOT be used. Function arguments MUST be literal types and MUST NOT be nested:

${commandSet.join("\n")}

Use the following format:

Request: the input question or request you must answer
Thought: you should always think about what to do
Function: a function to call following the requirements mentioned above
Result: the result of the function call
... (this Thought/Function/Function Input/Result can repeat N times)
Thought: I now know the final answer or have completed the request
Final result: the final an answer to the original question or an acknowledgement that the request is fulfilled

Begin!

Request: ${request}`;
}

function makeCommandSet(commands: CommandSet): string[] {
  return Object.entries(commands).map(([name, c]) => {
    const args = c.args.map((a) => `${a.name}: ${a.type}`);
    return `\`${name}(${args.join(", ")})\` - ${c.description}`;
  });
}
