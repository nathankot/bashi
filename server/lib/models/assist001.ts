import * as t from "io-ts";

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
  loopCount: t.number,
  resolvedActionGroups: t.array(
    t.intersection([
      ActionGroup,
      t.type({
        result: t.string,
      }),
    ])
  ),
  resolvedCommands: t.record(t.string, CommandExecuted),
  pending: t.union([
    t.null,
    t.type({
      actionGroup: ActionGroup,
      commands: t.array(CommandParsed),
    }),
  ]),
});
export type State = t.TypeOf<typeof State>;

export const MAX_LOOPS = 5;

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
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model: "assist-001",
};

const privateBuiltinCommands = {
  finish: {
    description: "mark that the request is finished",
    args: [],
    run: async (_, __, []) => ({ type: "null" }),
    returnType: "null",
  } as BuiltinCommandDefinition<[], "null">,
  fail: {
    returnType: "null",
    description: `indicate the request could not be interpreted`,
    args: [{ name: "reason", type: "string" }],
    run: async (_, __, ___) => ({ type: "null" }),
  } as BuiltinCommandDefinition<["string"], "null">,
};

const serverCommands = {
  ...builtinCommands,
  ...privateBuiltinCommands,
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
  let loopCount = state?.loopCount ?? 0;
  let pending = state?.pending;
  let resolvedCommands = state?.resolvedCommands ?? {};
  let resolvedActionGroups = state?.resolvedActionGroups ?? [];
  const requestContext: RequestContext = {
    ...input.requestContext,
    ...state?.requestContext,
  };

  // Interpreter loop that does the following:
  //
  // 1. For each pending thought/action, find commands and try to resolve them
  //   1a. Any commands that can be resolved server side should be
  //   1b. If the client provided any resolutions, use them
  //   1c. Some commands may need a redirection to the client
  // 2. Any resolutions from the above go into the new prompt
  // 3. Plugs the prompt into the model to ask for thought/actions to take
  // 4. Parse the completion into pending thought/actions
  // 5. Update state with the current results, exit if we have reached a sink, otherwise goto (1)

  let isFinished = false;

  try {
    while (true) {
      // 1. For each pending thought/action, find commands and try to resolve them
      if (pending != null) {
        let commandsToSendToClient: CommandParsed[] = [];
        let commandResults: Value[] = [];

        for (const pendingCommand of pending.commands) {
          const commandName = pendingCommand.name;
          const commandDef = allCommands[commandName];
          if (commandDef == null) {
            throw new Error(`the command ${commandName} is unknown`);
          }

          const maybeAlreadyResolved =
            resolvedCommands[pendingCommand.id.toString()];
          if (maybeAlreadyResolved != null) {
            commandResults.push(maybeAlreadyResolved.returnValue);
            continue;
          }

          // 1a. Any commands that can be resolved server side should be
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
                },
              };
            }
            const resolved = await runBuiltinCommand(
              serverCommandDef as any,
              modelDeps,
              input.requestContext ?? {},
              pendingCommand
            );
            commandResults.push(resolved.returnValue);
            resolvedCommands[pendingCommand.id.toString()] = resolved;
            // Account for the special finish command
            if (resolved.name === "finish") {
              isFinished = true;
            }
            continue;
          }

          //   1b. If the client provided any resolutions, use them
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
            commandResults.push(maybeClientResolution);
            resolvedCommands[pendingCommand.id.toString()] = {
              ...pendingCommand,
              type: "executed",
              returnValue: maybeClientResolution,
            };
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
            },
          };
        }

        // 2. Any resolutions from the above go into the new prompt
        resolvedActionGroups.push({
          ...pending.actionGroup,
          result: commandResults.map(valueToString).join("; "),
        });
      }

      // Reaching here implies that anything pending has been
      // dealt with and we are ready for more model output:
      pending = null;

      if (isFinished) {
        break;
      }
      if (loopCount >= MAX_LOOPS) {
        throw new HTTPError(`max iteration count of ${MAX_LOOPS} reached`, 400);
      }
      loopCount++;

      // 3. Plugs the prompt into the model to ask for thought/actions to take
      const prompt = makePrompt(allCommands, request, resolvedActionGroups);
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
      console.log("NKDEBUG", text);

      if (text === "") {
        isFinished = true;
        break;
      }

      // 4. Parse the completion into pending thought/actions
      if (!text.toLowerCase().startsWith("thought:")) {
        text = "Thought: " + text;
      }
      const commandsSoFar = Object.values(resolvedCommands).length;
      const newActionGroup = parseActionGroup(text);
      const newCommands = parseFunctionCalls(newActionGroup.action)
        .filter((f) => !f.args.some((a) => a.type === "call"))
        .map(
          (f, i): CommandParsed => ({
            args: f.args as any,
            name: f.name,
            type: "parsed",
            id: (commandsSoFar + i).toString(),
          })
        );
      log(
        "info",
        `thought: ${newActionGroup.thought}; action: ${newActionGroup.action}`
      );

      // 5. Update state with the current results, exit if we have reached a sink, otherwise goto (1)
      pending = {
        actionGroup: newActionGroup,
        commands: newCommands,
      };
    }
  } catch (e) {
    isFinished = true;
    throw e;
  } finally {
    modelDeps.setUpdatedSession({
      ...session,
      assist001State: isFinished
        ? undefined
        : {
            loopCount,
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
  };
}

function makePrompt(
  commands: CommandSet,
  request: string,
  resolvedActionGroups: State["resolvedActionGroups"]
): string {
  const header = `Answer the following questions as directly and as best you can.

You have access to tools denoted below in Typescript-like function declarations. String arguments MUST be quoted and any quotes inside them MUST be escaped. Functions that are not listed below MUST NOT be used. Function arguments MUST be literal types. Function calls MAY be nested:`;

  const format = `Use the following format:

Request: the input question or request you must answer
Thought: you should always think about what to do
Action: function(s) to call, delimited by ;
Result: the result of the function call
... (this Thought/Action/Result can repeat N times)
Thought: I have completed the request
Action: finish()`;

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

export function pendingCommandsForCallOrResult(
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
    const argResult = pendingCommandsForCallOrResult(
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
