import * as t from "io-ts";

import { IS_DEV } from "@lib/constants.ts";
import { ModelDeps } from "./modelDeps.ts";
import { wrap } from "@lib/log.ts";
import { HTTPError } from "@lib/errors.ts";
import { Value, valueToString } from "@lib/valueTypes.ts";
import {
  Input,
  ResultFinished,
  ResultNeedsRequestContext,
  ResultPendingCommands,
} from "./assistShared.ts";

import {
  Call,
  ActionGroup,
  parseActionGroup,
  parseFunctionCalls,
  CommandSet,
  CommandParsed,
  CommandExecuted,
  CommandDefinition,
  BuiltinCommandDefinition,
  builtinCommands,
  filterUnnecessary,
  checkRequestContext,
  runBuiltinCommand,
} from "@lib/command.ts";

import { RequestContext } from "@lib/requestContext.ts";

export const State = t.type({
  request: t.string,
  requestContext: RequestContext,
  modelCallCount: t.number,
  resolvedActionGroups: t.array(
    t.intersection([
      ActionGroup,
      t.type({
        result: t.string,
      }),
    ])
  ),
  resolvedCommands: t.array(CommandExecuted),
  pending: t.union([t.null, ActionGroup]),
});
export type State = t.TypeOf<typeof State>;

export const MAX_LOOPS = 15;
export const MAX_MODEL_CALLS = 5;

export const Name = t.literal("assist-001");
export type Name = t.TypeOf<typeof Name>;

export const Configuration = t.type({
  model: Name,
  commands: CommandSet,
});
export type Configuration = t.TypeOf<typeof Configuration>;

export { Input };

export const Output = t.type({
  model: Name,
  request: t.string,
  result: t.union([
    ResultFinished,
    ResultNeedsRequestContext,
    ResultPendingCommands,
  ]),
});
export type Output = t.TypeOf<typeof Output> & {
  dev?: { prompt: string; completion: string }[];
};

export const defaultConfiguration: Partial<Configuration> = {
  model: "assist-001",
};

const privateBuiltinCommands = {
  finish: {
    description: "mark request/question as fulfilled",
    args: [],
    run: async (_, __, []) => ({ type: "void" }),
    returnType: "void",
  } as BuiltinCommandDefinition<[], "void">,
  fail: {
    returnType: "void",
    description: `indicate the request cannot be fulfilled with the available tools`,
    args: [{ name: "reason", type: "string" }],
    run: async (_, __, ___) => ({ type: "void" }),
  } as BuiltinCommandDefinition<["string"], "void">,
};

// Commands that the model implicitly knows, does not need to be
// sent to the model explicitly.
const languageBuiltinCommands = {
  "__+__": {
    args: [
      { name: "lhs", type: "string" },
      { name: "rhs", type: "string" },
    ],
    description: "string concatenation using the + infix operand",
    returnType: "string",
    run: async (_, __, [lhs, rhs]) => ({
      type: "string",
      value: lhs.value + rhs.value,
    }),
  } as BuiltinCommandDefinition<["string", "string"], "string">,
};

const serverCommands = {
  ...builtinCommands,
  ...privateBuiltinCommands,
  ...languageBuiltinCommands,
};

const sinks: Record<string, true> = {
  fail: true,
  finish: true,
};

function isServerCommand(
  commandName: string
): commandName is keyof typeof serverCommands {
  return commandName in serverCommands;
}

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
      "resolvedCommands" in input
    )
  ) {
    throw new HTTPError(
      `at least one of 'request', 'requestContext' or 'resolvedCommands' must be populated`,
      400
    );
  }

  const allCommands: Record<string, CommandDefinition> = {
    ...configuration.commands,
    ...serverCommands,
  };

  let dev:
    | {
        prompt: string;
        completion: string;
      }[]
    | undefined = IS_DEV() ? [] : undefined;

  const session = modelDeps.session;
  const isContinue = input.request == null;
  const state = isContinue ? session.assist001State : undefined;
  const request = input.request ?? state?.request;
  if (request == null) {
    throw new HTTPError(
      "no request could be found, either in the 'request' field, " +
        " or in a pending request",
      400
    );
  }

  // Key pieces of state:
  let modelCallCount = state?.modelCallCount ?? 0;
  let pending = state?.pending;
  let resolvedCommands = state?.resolvedCommands ?? [];
  let resolvedActionGroups = state?.resolvedActionGroups ?? [];
  const requestContext: RequestContext = {
    ...input.requestContext,
    ...state?.requestContext,
  };

  const resolvedCommandsDict = (): Record<string, CommandExecuted> =>
    resolvedCommands.reduce((a, e) => ({ ...a, [e.id]: e }), {});

  // Interpreter loop that does the following:
  //
  // 1. For each pending thought/action, find commands and try to resolve them
  //   1a. If the client provided any resolutions, use them
  //   1b. Any commands that can be resolved server side should be
  //   1c. Some commands may need a redirection to the client
  // 2. Any resolutions from the above go into the new prompt
  // 3. Plugs the prompt into the model to ask for thought/actions to take
  // 4. Parse the completion into pending thought/actions
  // 5. Update state with the current results, exit if we have reached a sink, otherwise goto (1)

  let isFinished = false;

  try {
    let loopNumber = 0;
    commandResolutionLoop: while (true) {
      if (loopNumber >= MAX_LOOPS)
        throw new Error(`max loops of ${MAX_LOOPS} reached`);
      loopNumber++;
      // 1. For each pending thought/action, find commands and try to resolve them
      if (pending != null) {
        const actionGroupsSofar = Object.values(resolvedActionGroups).length;
        const topLevelCalls = parseFunctionCalls(pending.action);
        // Get the first top level call that is still pending, we want
        // to handle each top level call in sequence.
        let pendingCommands: CommandParsed[] = [];
        let topLevelCommandResults: Value[] = [];
        for (const [i, topLevelCall] of topLevelCalls.entries()) {
          const pendingCommandsOrResult = getPendingCommandsOrResult(
            `${actionGroupsSofar}.${i}`,
            topLevelCall,
            resolvedCommandsDict()
          );
          if ("result" in pendingCommandsOrResult) {
            topLevelCommandResults.push(pendingCommandsOrResult.result);
          }
          if ("pendingCommands" in pendingCommandsOrResult) {
            pendingCommands = pendingCommandsOrResult.pendingCommands;
            break;
          }
        }

        let commandsToSendToClient: CommandParsed[] = [];
        for (const pendingCommand of pendingCommands) {
          const commandName = pendingCommand.name;
          const commandDef = allCommands[commandName];
          if (commandDef == null) {
            throw new Error(`the command ${commandName} is unknown`);
          }
          //   1a. If the client provided any resolutions, use them
          const maybeClientResolution =
            input.resolvedCommands == null
              ? null
              : input.resolvedCommands[pendingCommand.id.toString()];
          if (maybeClientResolution) {
            if (maybeClientResolution.type !== commandDef.returnType) {
              throw new HTTPError(
                `command ${commandName} expects return type ` +
                  `${commandDef.returnType} but got ${maybeClientResolution.type}`,
                400
              );
            }
            resolvedCommands.push({
              ...pendingCommand,
              type: "executed",
              returnValue: maybeClientResolution,
            });
            continue;
          }

          // 1b. Any commands that can be resolved server side should be
          if (isServerCommand(commandName)) {
            const serverCommandDef = serverCommands[commandName];
            const missingRequestContext = checkRequestContext(
              serverCommandDef,
              requestContext
            );
            if (missingRequestContext !== true) {
              return {
                model: "assist-001",
                request,
                result: {
                  type: "needs_request_context",
                  missingRequestContext,
                  resolvedCommands,
                },
                dev,
              };
            }
            const resolved = await runBuiltinCommand(
              serverCommandDef as any,
              modelDeps,
              input.requestContext ?? {},
              pendingCommand
            );
            resolvedCommands.push(resolved);
            continue;
          }

          commandsToSendToClient.push(pendingCommand);
        }

        //   1c. Some commands may need a redirection to the client
        if (commandsToSendToClient.length > 0) {
          return {
            model: "assist-001",
            request,
            result: {
              type: "pending_commands",
              pendingCommands: commandsToSendToClient,
              resolvedCommands,
            },
            dev,
          };
        }

        // Go through the loop again if we have not resolved all top-level commands:
        if (topLevelCommandResults.length !== topLevelCalls.length) {
          continue commandResolutionLoop;
        }

        // 2. Any resolutions from the above go into the new prompt
        resolvedActionGroups.push({
          ...pending,
          result: topLevelCommandResults.map(valueToString).join("; "),
        });

        // Reaching here implies that anything pending has been
        // dealt with and we are ready for more model output:
        pending = null;

        // Mark as finished if any of the top level commands were sinks:
        for (const topLevelCall of topLevelCalls) {
          if (sinks[topLevelCall.name] === true) {
            isFinished = true;
          }
        }
      }

      if (isFinished) {
        break;
      }

      if (modelCallCount >= MAX_MODEL_CALLS) {
        throw new HTTPError(
          `max iteration count of ${MAX_MODEL_CALLS} reached`,
          400
        );
      }
      modelCallCount++;

      // 3. Plugs the prompt into the model to ask for thought/actions to take
      const prompt = makePrompt(
        {
          ...configuration.commands,
          ...serverCommands,
          ...privateBuiltinCommands,
        },
        request,
        resolvedActionGroups
      );

      const completion = await modelDeps.openai.createCompletion(
        {
          model: "text-davinci-003",
          // TODO return error if completion tokens has reached this limit
          max_tokens: session.configuration.maxResponseTokens,
          best_of: session.configuration.bestOf,
          echo: false,
          temperature: 0.5,
          prompt: [prompt],
          stop: "\nResult:",
        },
        {
          signal: modelDeps.signal,
        }
      );
      log = wrap({ total_tokens: completion.data.usage?.total_tokens }, log);
      log("info", { message: "tokens used" });
      let text = completion.data.choices[0]?.text ?? "";

      dev?.push({
        prompt,
        completion: text,
      });

      if (text === "") {
        isFinished = true;
        break;
      }

      // 4. Parse the completion into pending thought/actions
      if (!text.toLowerCase().startsWith("thought:")) {
        text = "Thought: " + text;
      }

      // 5. Update state with the current results, exit if we have reached a sink,
      //    otherwise goto (1)
      pending = parseActionGroup(text);
      if (IS_DEV()) {
        log("info", `thought: ${pending.thought}; action: ${pending.action}`);
      }
    }
  } catch (e) {
    isFinished = true;
    if (IS_DEV()) {
      log("error", `dev information during error: ${JSON.stringify(dev)}`);
    }
    throw e;
  } finally {
    modelDeps.setUpdatedSession({
      ...session,
      assist001State: isFinished
        ? undefined
        : {
            modelCallCount,
            request,
            requestContext,
            pending: pending ?? null,
            resolvedActionGroups,
            resolvedCommands,
          },
    });
  }

  return {
    model: "assist-001",
    request,
    result: {
      type: "finished",
      resolvedCommands,
    },
    dev,
  };
}

function makePrompt(
  commands: CommandSet,
  request: string,
  resolvedActionGroups: State["resolvedActionGroups"]
): string {
  const header = `Fulfill the question/request as best you can. Aim to minimize the number of Actions used.

The language for Action is a tiny subset of javascript, ONLY these features are available:

* function calls
* function call nesting
* string concatenation using +

Available functions are declared below, these are the only functions available:`;

  const format = `Use the following format:
Request: the question or request you must answer
Thought: you should always think about what to do
Action: one or more expressions composing available functions delimited by ;
Result: the result of the Action expression
... (this Thought/Action/Result can repeat N times)`;

  const existingActionGroups = resolvedActionGroups
    .map(
      (g) => `Thought: ${g.thought}\nAction: ${g.action}\nResult: ${g.result}`
    )
    .join("\n");

  const commandSet = makeCommandSet(
    filterUnnecessary(request + " " + existingActionGroups, commands)
  ).join("\n");

  return `${header}

${commandSet}

${format}

Begin!

Request: ${request}${
    existingActionGroups.length > 0 ? "\n" + existingActionGroups : ""
  }
Thought: `;
}

function makeCommandSet(commands: CommandSet): string[] {
  return Object.entries(commands).map(([name, c]) => {
    const args = c.args.map(
      (a) => `${a.name.includes(" ") ? `"${a.name}"` : a.name}: ${a.type}`
    );
    return `\`${name}(${args.join(", ")}) => ${c.returnType}\` - ${
      c.description
    }`;
  });
}

export function getPendingCommandsOrResult(
  commandId: string,
  call: Call,
  resolvedCommmands: Record<string, CommandExecuted>
): { pendingCommands: CommandParsed[] } | { result: Value } {
  // See if its already resolved
  const maybeAlreadyResolved = resolvedCommmands[commandId];
  if (maybeAlreadyResolved != null) {
    if (maybeAlreadyResolved.name != call.name) {
      throw new Error(
        `corruption! expected resolved call to be ${call.name} ` +
          `but got ${maybeAlreadyResolved.name}`
      );
    }
    const result = maybeAlreadyResolved.returnValue;
    return {
      result,
    };
  }

  // Build up a list of nested commands that must be resolved,
  // or if they are all resolved build up a list of resolved arguments.
  let pendingCommands: CommandParsed[] = [];
  let resolvedArguments: Value[] | null = [];
  for (const [i, arg] of Object.entries(call.args)) {
    if (arg.type !== "call") {
      resolvedArguments?.push(arg);
      continue;
    }
    const argResult = getPendingCommandsOrResult(
      commandId + "." + i,
      arg,
      resolvedCommmands
    );
    if ("pendingCommands" in argResult) {
      pendingCommands = [...pendingCommands, ...argResult.pendingCommands];
      // if at least 1 arg is still pending, then we don't have resolved arguments:
      resolvedArguments = null;
      continue;
    }
    resolvedArguments?.push(argResult.result);
  }

  // If all of the arguments are resolved then this call
  // becomes pending:
  if (resolvedArguments != null) {
    if (resolvedArguments.length !== call.args.length) {
      throw new Error(
        `corruption! for ${call.name} expected ${call.args.length} ` +
          `arguments but got ${resolvedArguments.length}`
      );
    }
    return {
      pendingCommands: [
        {
          type: "parsed",
          args: resolvedArguments,
          id: commandId,
          name: call.name,
        },
      ],
    };
  }

  // Otherwise we need to resolve the nested children first:
  return { pendingCommands };
}
