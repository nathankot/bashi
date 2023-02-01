import * as t from "io-ts";

import { IS_DEV } from "@lib/constants.ts";
import { ModelDeps } from "./modelDeps.ts";
import { wrap } from "@lib/log.ts";
import { HTTPError } from "@lib/errors.ts";
import { ValueType, Value, valueToString } from "@lib/valueTypes.ts";
import {
  Input,
  ResultFinished,
  ResultNeedsRequestContext,
  ResultPendingCommands,
} from "./assistShared.ts";

import {
  Memory,
  Expr,
  AnyBuiltinCommandDefinition,
  BuiltinCommandDefinition,
  ActionGroup,
  parseActionGroup,
  parseStatements,
  CommandSet,
  CommandParsed,
  CommandExecuted,
  builtinCommands,
  filterUnnecessary,
  runBuiltinCommand,
} from "@lib/command.ts";

import { RequestContextRequired } from "@lib/requestContext.ts";

export const State = t.type({
  request: t.string,
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
  memory: Memory,
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
  dev?: {
    results: string[];
    prompts: { prompt: string; completion: string }[];
  };
};

export const defaultConfiguration: Partial<Configuration> = {
  model: "assist-001",
};

const privateBuiltinCommands = {
  askForText: {
    isBuiltin: true,
    cost: -1000,
    returnType: "string",
    description: "get the input text for editing",
    args: [],
    run: async (_, __, memory) => {
      if (
        memory.requestContext.text == null ||
        memory.requestContext.text.type !== "string"
      ) {
        throw new RequestContextRequired({ text: { type: "string" } });
      }
      return memory.requestContext.text;
    },
  } as BuiltinCommandDefinition<[], "string">,
  finish: {
    isBuiltin: true,
    cost: -1000,
    description: "mark request/question as fulfilled",
    args: [],
    run: async (_, []) => ({ type: "void" }),
    returnType: "void",
  } as BuiltinCommandDefinition<[], "void">,
  fail: {
    isBuiltin: true,
    cost: -1000,
    returnType: "void",
    description: `indicate the request cannot be fulfilled with the available tools`,
    args: [{ name: "reason", type: "string" }],
    run: async (_, ___) => ({ type: "void" }),
  } as BuiltinCommandDefinition<["string"], "void">,
};

// Commands that the model implicitly knows, does not need to be
// sent to the model explicitly.
const languageBuiltinCommands = {
  $ref: {
    isBuiltin: true,
    description: "retrieve a variable",
    args: [{ name: "identifier", type: "string" }],
    returnType: "mixed",
    run: async (_, [iden], memory) => {
      const maybeValue = memory.variables[iden.value];
      if (maybeValue == null) {
        throw new Error(`the variable '${iden.value}' does not exist`);
      }
      return maybeValue;
    },
  } as BuiltinCommandDefinition<["string"], "mixed">,
  "__=__": {
    overloads: ValueType.types
      .map((t) => t.value)
      .map(
        (t): AnyBuiltinCommandDefinition => ({
          isBuiltin: true,
          description: "assign a variable",
          args: [
            { name: "identifier", type: "string" },
            { name: "value", type: t },
          ],
          returnType: "void",
          run: async (_, [lhs, rhs], memory) => {
            memory.variables[lhs.value] = rhs;
            return { type: "void" };
          },
        })
      ),
  },
  "__+__": {
    overloads: [
      {
        isBuiltin: true,
        description: "number addition the + infix operand",
        args: [
          { name: "lhs", type: "number" },
          { name: "rhs", type: "number" },
        ],
        returnType: "number",
        run: async (_, [lhs, rhs]) => ({
          type: "number",
          value: lhs.value + rhs.value,
        }),
      } as BuiltinCommandDefinition<["number", "number"], "number">,
      {
        isBuiltin: true,
        args: [
          { name: "lhs", type: "string" },
          { name: "rhs", type: "string" },
        ],
        description: "string concatenation using the + infix operand",
        returnType: "string",
        run: async (_, [lhs, rhs]) => ({
          type: "string",
          value: lhs.value + rhs.value,
        }),
      } as BuiltinCommandDefinition<["string", "string"], "string">,
    ] as AnyBuiltinCommandDefinition[],
  },
};

const serverCommands = {
  ...builtinCommands,
  ...privateBuiltinCommands,
  ...languageBuiltinCommands,
} as Record<
  string,
  | AnyBuiltinCommandDefinition
  | {
      overloads: AnyBuiltinCommandDefinition[];
    }
>;

const sinks: Record<string, true> = {
  fail: true,
  finish: true,
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
      "resolvedCommands" in input
    )
  ) {
    throw new HTTPError(
      `at least one of 'request', 'requestContext' or 'resolvedCommands' must be populated`,
      400
    );
  }

  const clientCommands = configuration.commands;

  let dev: Output["dev"] = IS_DEV() ? { prompts: [], results: [] } : undefined;

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
  let memory = {
    variables: {
      ...state?.memory?.variables,
    },
    requestContext: {
      ...input.requestContext,
      ...state?.memory?.requestContext,
    },
  };
  let modelCallCount = state?.modelCallCount ?? 0;
  let pending = state?.pending;
  let resolvedCommands = state?.resolvedCommands ?? [];
  let resolvedActionGroups = state?.resolvedActionGroups ?? [];

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
      // 1. For each pending thought/action, find expressions and try to resolve them
      if (pending != null) {
        const actionGroupsSofar = Object.values(resolvedActionGroups).length;
        const topLevelExpressions = parseStatements(pending.action);
        // Get the first top level call that is still pending, we want
        // to handle each top level call in sequence.
        let pendingCommands: CommandParsed[] = [];
        let topLevelExpressionResults: Value[] = [];
        for (const [i, topLevelExpression] of topLevelExpressions.entries()) {
          const pendingCommandsOrResult = getPendingCommandsOrResult(
            `${actionGroupsSofar}.${i}`,
            topLevelExpression,
            resolvedCommandsDict()
          );
          if ("result" in pendingCommandsOrResult) {
            topLevelExpressionResults.push(pendingCommandsOrResult.result);
          }
          if ("pendingCommands" in pendingCommandsOrResult) {
            pendingCommands = pendingCommandsOrResult.pendingCommands;
            // Break here so that the client is able to handle this top level
            // call, before handling the next one.
            break;
          }
        }

        let commandsToSendToClient: CommandParsed[] = [];
        pendingCommandLoop: for (const pendingCommand of pendingCommands) {
          const commandName = pendingCommand.name;
          const clientCommandDef = clientCommands[commandName];
          const serverCommandDef = serverCommands[commandName];
          if (clientCommandDef == null && serverCommandDef == null) {
            throw new Error(`the command ${commandName} is unknown`);
          }
          if (serverCommandDef != null) {
            // 1b. Any commands that can be resolved server side should be

            // If the command was already previously run with identical arguments,
            // then re-use the return value.
            for (const resolved of resolvedCommands) {
              if (
                resolved.name === pendingCommand.name &&
                resolved.args.every((arg, i) => {
                  const pendingArg = pendingCommand.args[i];
                  if (pendingArg == null) {
                    return false;
                  }
                  if (pendingArg.type !== arg.type) {
                    return false;
                  }
                  if (
                    "value" in pendingArg &&
                    "value" in arg &&
                    pendingArg.value !== arg.value
                  ) {
                    return false;
                  }
                  return true;
                })
              ) {
                resolvedCommands.push({
                  ...resolved,
                  id: pendingCommand.id,
                });
                continue pendingCommandLoop;
              }
            }

            try {
              const resolved = await runBuiltinCommand(
                serverCommandDef,
                modelDeps,
                pendingCommand,
                memory
              );
              resolvedCommands.push(resolved);
              continue pendingCommandLoop;
            } catch (e) {
              if (e instanceof RequestContextRequired) {
                return {
                  model: "assist-001",
                  request,
                  result: {
                    type: "needs_request_context",
                    missingRequestContext: e.requirement,
                    resolvedCommands,
                  },
                  dev,
                };
              }
              throw e;
            }
          } else if (clientCommandDef != null) {
            //   1a. If the client provided any resolutions, use them
            const maybeClientResolution =
              input.resolvedCommands == null
                ? null
                : input.resolvedCommands[pendingCommand.id.toString()];
            if (maybeClientResolution) {
              if (clientCommandDef.returnType !== maybeClientResolution.type) {
                throw new HTTPError(
                  `command ${commandName} expects return type to be ` +
                    `${clientCommandDef.returnType} but got ${maybeClientResolution.type}`,
                  400
                );
              }
              resolvedCommands.push({
                ...pendingCommand,
                type: "executed",
                returnValue: maybeClientResolution,
              });
              continue pendingCommandLoop;
            }
            commandsToSendToClient.push(pendingCommand);
          }
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
        if (topLevelExpressionResults.length !== topLevelExpressions.length) {
          continue commandResolutionLoop;
        }

        // 2. Any resolutions from the above go into the new prompt
        const result = topLevelExpressionResults.map(valueToString).join("; ");
        resolvedActionGroups.push({
          ...pending,
          result,
        });
        dev?.results.push(result);
        if (IS_DEV()) {
          log("info", `result: ${result}`);
        }

        // Reaching here implies that anything pending has been
        // dealt with and we are ready for more model output:
        pending = null;

        // Mark as finished if any of the top level commands were sinks:
        for (const topLevelExpr of topLevelExpressions) {
          if (topLevelExpr.type !== "call") {
            continue;
          }
          if (sinks[topLevelExpr.name] === true) {
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
          ...clientCommands,
          ...builtinCommands,
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

      dev?.prompts.push({
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
            memory,
            modelCallCount,
            request,
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
  const header = `Fulfill the question/request as best and directly as you can. Aim to minimize the number of Actions used. If the question cannot be answered, do not make things up, indicate failure with fail().

The language for Action is a tiny subset of javascript, only use these available features:

* function calls and composition/nesting
* string concatenation using +
* simple variable assignment using var

Functions are declared below, you must not use any other functions. When calling pay attention to syntax and ensure strings are escaped correctly. Prefer functions ordered earlier in thelist.`;

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
  // g.result.length > 150 ? "<result too long, redacted>" : g.result

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
  return Object.entries(commands)
    .sort(([aName, a], [bName, b]) => {
      if (aName === bName) return 0;
      if ((a.cost ?? 0) !== (b.cost ?? 0)) {
        return (a.cost ?? 0) < (b.cost ?? 0) ? -1 : 0;
      }
      if ("isBuiltin" in a && a.isBuiltin) {
        return -1;
      }
      if ("isBuiltin" in b && b.isBuiltin) {
        return 1;
      }
      return aName < bName ? -1 : 1;
    })
    .map(([name, c]) => {
      const args = c.args.map(
        (a) => `${a.name.includes(" ") ? `"${a.name}"` : a.name}: ${a.type}`
      );
      return `\`${name}(${args.join(", ")}): ${c.returnType}\` - ${
        c.description
      }`;
    });
}

export function getPendingCommandsOrResult(
  commandId: string,
  expr: Expr,
  resolvedCommmands: Record<string, CommandExecuted>
): { pendingCommands: CommandParsed[] } | { result: Value } {
  // If we have an terminal value:
  if (expr.type !== "call") {
    return { result: expr };
  }

  // See if its already resolved
  const maybeAlreadyResolved = resolvedCommmands[commandId];
  if (maybeAlreadyResolved != null) {
    if (maybeAlreadyResolved.name != expr.name) {
      throw new Error(
        `corruption! expected resolved call to be ${expr.name} ` +
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
  for (const [i, arg] of Object.entries(expr.args)) {
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
    if (resolvedArguments.length !== expr.args.length) {
      throw new Error(
        `corruption! for ${expr.name} expected ${expr.args.length} ` +
          `arguments but got ${resolvedArguments.length}`
      );
    }
    return {
      pendingCommands: [
        {
          type: "parsed",
          args: resolvedArguments,
          id: commandId,
          name: expr.name,
        },
      ],
    };
  }

  // Otherwise we need to resolve the nested children first:
  return { pendingCommands };
}
