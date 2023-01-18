import * as t from "io-ts";

import {
  CommandSet,
  Command,
  BuiltinCommandDefinition,
  builtinCommands,
  filterUnnecessary,
  commandInterceptors,
  parseCommand,
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
  clarification: t.type({
    question: t.string,
    answer: t.string,
  }),
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

const privateCommands = {
  ask: {
    description: "ask for more information, use only when necessary",
    args: [{ name: "the question", type: "string" }],
  } as BuiltinCommandDefinition<["string"]>,

  answer: {
    description:
      "answer the original question directly based on existing knowledge. this is preferred",
    args: [
      {
        name: "answer",
        type: "string",
      },
    ],
  } as BuiltinCommandDefinition<["string"]>,

  now: {
    description: "get the current time in ISO8601 format",
    args: [],
  } as BuiltinCommandDefinition<[]>,

  relativeTime: {
    description: "get the time relative to now in ISO8601 format",
    args: [
      {
        name: "natural language description of relative time",
        type: "string",
      },
    ],
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

  const session = modelDeps.session;
  const isContinue = input.request == null;
  const pendingAssistRequest = isContinue
    ? session.pendingAssist001Request
    : undefined;
  const request = input.request ?? pendingAssistRequest?.request;
  const requestContext: RequestContext = {
    ...input.requestContext,
    ...pendingAssistRequest?.requestContext,
  };

  const beginSection =
    pendingAssistRequest?.scratch ??
    (request != null ? `Begin!\n\nRequest: ${request.trim()}\nThought:` : null);

  if (beginSection == null || request == null) {
    throw new HTTPError(
      "no request could be found, either in the 'request' field, " +
        " or in a pending request",
      400
    );
  }

  if (input.clarification != null) {
    // TODO add observation/result to the begin section
    // TODO: actually this should just be a client-resolved result of the ask() command?
  }

  let isFinished = false;
  let commands = pendingAssistRequest?.commands ?? [];

  const maxLoops = 5; // TODO turn into config
  let n = pendingAssistRequest?.loopCount ?? 0;
  let scratch = beginSection;

  try {
    while (true) {
      // Always try to resolve any unresolved commands first.
      for (const command of commands) {
        if (command.type === "executed") {
          continue;
        }

        if (command.type === "parse_error" || command.type === "invalid") {
          log(
            "error",
            `failed to interpret command: ${JSON.stringify(command)}`
          );
          throw new HTTPError("could not interpret model result", 400);
        }

        // TODO: process private commands:

        // Check interceptors have the request context that they need:
        let missingRequestContext: null | RequestContextRequirement = null;
        const commandName = command.name;
        for (const interceptor of Object.values(commandInterceptors)) {
          if (interceptor.commandName !== commandName) {
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
          return {
            model: "assist-001",
            request,
            result: {
              type: "needs_request_context",
              missingRequestContext,
            },
          };
        }
      }

      // Run all of the command interceptors:
      for (const interceptor of Object.values(commandInterceptors)) {
        commands = await modelDeps.faultHandlingPolicy.execute(
          async ({ signal }) =>
            interceptor.commandsInterceptor(
              { ...modelDeps, signal },
              input,
              commands
            )
        );
      }

      if (isFinished) {
        break;
      }

      if (n >= maxLoops) {
        throw new HTTPError(`max iteration count of ${maxLoops} reached`, 400);
      }
      n++;

      const enabledBuiltinCommands: Partial<typeof builtinCommands> =
        session.configuration.enabledBuiltinCommands.reduce(
          (a, enabledCommand) =>
            builtinCommands[enabledCommand] == null
              ? a
              : {
                  ...a,
                  [enabledCommand]: builtinCommands[enabledCommand],
                },
          {}
        );

      const commandSet = filterUnnecessary(scratch, {
        ...configuration.commands,
        ...enabledBuiltinCommands,
        ...privateCommands,
      });

      const prompt = makePrompt(commandSet, scratch);

      console.log("NKDEBUG prompt is", prompt);

      const completion = await modelDeps.openai.createCompletion(
        {
          model: "text-davinci-003",
          max_tokens: session.configuration.maxResponseTokens, // TODO return error if completion tokens has reached this limit
          best_of: session.configuration.bestOf,
          echo: false,
          prompt: [prompt],
          stop: "\nResult:",
        },
        {
          signal: modelDeps.signal,
        }
      );

      log = wrap({ total_tokens: completion.data.usage?.total_tokens }, log);
      log("info", { message: "tokens used" });

      const text = completion.data.choices[0]?.text ?? "";
      console.log("NKDEBUG", text);

      const parseDeps = {
        log,
        now: modelDeps.now(),
        knownCommands: commandSet,
        sessionConfiguration: modelDeps.session.configuration,
      };

      scratch = scratch + text;
      let pendingCommands: Command[] = [];
      for (const line of text.split("\n")) {
        if (line == null) {
          continue;
        }
        let actionLine: string | null = null;
        if (line.toLowerCase().startsWith("action:")) {
          actionLine = line.substring("action:".length).trim();
        }
        if (line.toLowerCase().startsWith("final action:")) {
          actionLine = line.substring("final action:".length).trim();
        }
        if (actionLine == null) {
          continue;
        }
        for (const component of actionLine.split("|")) {
          const parsed = parseCommand(parseDeps, component.trim());
          if (parsed != null) {
            pendingCommands.push(parsed);
          }
        }
      }

      if (pendingCommands.length === 0) {
        isFinished = true;
      }

      commands = [...commands, ...pendingCommands];
    }
  } catch (e) {
    isFinished = true;
    throw e;
  } finally {
    modelDeps.setUpdatedSession({
      ...session,
      pendingAssist001Request: isFinished
        ? undefined
        : {
            request,
            requestContext,
            loopCount: n,
            commands,
            scratch,
          },
    });
  }

  // If we reach here, then both command execution and the model has been resolved:
  return {
    model: "assist-001",
    request,
    result: {
      type: "ok",
      commands,
    },
  };
}

function makePrompt(commands: CommandSet, beginSection: string): string {
  if (!beginSection.startsWith("Begin!")) {
    throw new Error("beginSection must start with Begin!");
  }

  const commandSet = makeCommandSet(commands);
  return `Answer the following questions as best you can.

You have access to the following tools/functions denoted in Typescript-like declarations. String arguments MUST be quoted and any quotes inside them MUST be escaped. Functions that are not listed below MUST NOT be used. Function arguments MUST be literal types and MUST NOT be nested:

${commandSet.join("\n")}

Use the following format:

Request: the input question or request you must answer
Thought: you should always think about what to do
Action: function(s) to call following the above requirements, delimited by |
Result: the result of the function call
... (this Thought/Action/Result can repeat N times)
Thought: I have completed the request
Final Action: a final function call to fulfill the request. for example answer("an answer to the original question")

${beginSection}`;
}

function makeCommandSet(commands: CommandSet): string[] {
  return Object.entries(commands).map(([name, c]) => {
    const args = c.args.map((a) => `${a.name}: ${a.type}`);
    return `\`${name}(${args.join(", ")})\` - ${c.description}`;
  });
}
