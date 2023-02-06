// @deno-types="@/types/gpt-3-encoder.d.ts"
import * as gptEncoder from "gpt-3-encoder";
import * as t from "io-ts";

import { IS_DEV } from "@lib/constants.ts";
import { ModelDeps } from "./modelDeps.ts";
import { wrap } from "@lib/log.ts";
import { HTTPError } from "@lib/errors.ts";
import {
  ValueType,
  Value,
  valueToString,
  ValueForType,
} from "@lib/valueTypes.ts";
import {
  Input,
  ResultFinished,
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

export const MAX_LOOPS = 500;
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
  result: t.union([ResultFinished, ResultPendingCommands]),
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

function overload<
  LHS extends ValueType,
  RHS extends ValueType,
  R extends ValueType
>(
  lhs: LHS,
  rhs: RHS,
  returnType: R,
  fn: (lhs: ValueForType<LHS>, rhs: ValueForType<RHS>) => ValueForType<R>
): AnyBuiltinCommandDefinition {
  return {
    isBuiltin: true,
    description: `overload for ${lhs}, ${rhs} => ${returnType}`,
    args: [
      { name: "lhs", type: lhs },
      { name: "rhs", type: rhs },
    ],
    returnType,
    run: async (_, [lhs, rhs]) => fn(lhs, rhs),
  };
}

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
      overload("number", "number", "number", (l, r) => ({
        type: "number",
        value: l.value + r.value,
      })),
      overload("string", "string", "string", (l, r) => ({
        type: "string",
        value: l.value + r.value,
      })),
      overload("number", "string", "string", (l, r) => ({
        type: "string",
        value: l.value.toString() + r.value,
      })),
      overload("string", "number", "string", (l, r) => ({
        type: "string",
        value: l.value + r.value.toString(),
      })),
      overload("boolean", "string", "string", (l, r) => ({
        type: "string",
        value: (l.value === true ? "true" : "false") + r.value,
      })),
      overload("string", "boolean", "string", (l, r) => ({
        type: "string",
        value: l.value + (r.value === true ? "true" : "false"),
      })),
    ],
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

  if (!("request" in input || "resolvedCommands" in input)) {
    throw new HTTPError(
      `at least one of 'request' or 'resolvedCommands' must be populated`,
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
  };
  let modelCallCount = state?.modelCallCount ?? 0;
  let pending = state?.pending;
  let resolvedCommands = state?.resolvedCommands ?? [];
  let resolvedActionGroups = state?.resolvedActionGroups ?? [];

  const resolvedCommandsDict = (): Record<string, CommandExecuted> =>
    resolvedCommands.reduce((a, e) => ({ ...a, [e.id]: e }), {});

  const resultsExternal = (): Value[] =>
    resolvedCommands
      // Results should only have the top level commands:
      .filter((c) => (c.id.match(/\./g) ?? []).length === 1)
      .filter((c) => c.returnValue.type !== "void")
      .map((c) => c.returnValue);

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
        const actionGroupsSoFar = Object.values(resolvedActionGroups).length;
        const topLevelExpressions = parseStatements(pending.action);
        // Get the first top level call that is still pending, we want
        // to handle each top level call in sequence.
        let pendingCommands: CommandParsed[] = [];
        let topLevelExpressionResults: Value[] = [];
        for (const [i, topLevelExpression] of topLevelExpressions.entries()) {
          const pendingCommandsOrResult = getPendingCommandsOrResult(
            `${actionGroupsSoFar}.${i}`,
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

            const resolved = await runBuiltinCommand(
              serverCommandDef,
              modelDeps,
              pendingCommand,
              memory
            );
            resolvedCommands.push(resolved);
            continue pendingCommandLoop;
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
              results: resultsExternal(),
            },
            dev,
          };
        }

        // Go through the loop again if we have not resolved all top-level commands:
        if (topLevelExpressionResults.length !== topLevelExpressions.length) {
          continue commandResolutionLoop;
        }

        // 2. Any resolutions from the above go into the new prompt
        let resultStrings = [];
        for (const [i, result] of topLevelExpressionResults.entries()) {
          const varName = `result_${actionGroupsSoFar}_${i}`;
          memory.variables[varName] = result;
          let resultStr = valueToString(result);
          try {
            const toksLength = gptEncoder.encode(resultStr).length;
            if (toksLength > 300) {
              resultStr =
                resultStr.substring(0, 300 * 4) +
                " [... truncated: full value stored in var `" +
                varName +
                "`]";
            }
          } catch {}
          resultStrings.push(resultStr);
        }
        const result = resultStrings.join("; ");
        resolvedActionGroups.push({ ...pending, result });
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
        // Mark as finished if top level commands were empty (implicit finish):
        if (topLevelExpressions.length === 0) {
          isFinished = true;
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
          temperature: 0.3,
          prompt: [prompt],
          stop: "\nResult:",
          logit_bias: {
            8818: -10, // `function`
            22446: -100, // `().`
            14804: -100, // `=>`
            5218: -100, // ` =>`
            21737: -10, // `[]`
            58: -10, // `[`
            60: -10, // `]`
            685: -10, // ` [`
            2361: -10, // ` ]`
            14692: -10, // `["`
            8973: -10, // `"]`
            1391: -10, // ` {`
            1782: -10, // ` }`
            90: -10, // `{`
            92: -10, // `}`
            11018: -1, // `math` - the LLM has a tendency to throw arbitrary expressions in here
            32165: 1, // `fail`
            15643: 1, // `finish`
            7220: 1, // `user`
          },
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
    if ("response" in e) {
      log(
        "error",
        `got openAI error, response status was: ${e.response.status}, response data: \n${e.response.data}`
      );
    }
    if (IS_DEV()) {
      log(
        "error",
        `dev information (completions) during error: ${JSON.stringify(
          dev?.prompts.map((p) => p.completion)
        )}`
      );
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
      results: resultsExternal(),
    },
    dev,
  };
}

function makePrompt(
  commands: CommandSet,
  request: string,
  resolvedActionGroups: State["resolvedActionGroups"]
): string {
  const header = `Interpret the question/request into a set of result-producing actions with the goal of fulfilling the question/request, as if you were an AI assistant. Do not make things up. If additional input is required use actions to retrieve it from the user. If the question/request cannot be fulfilled indicate with fail(). Aim to be concise and minimize the number of actions necessary. If an answer to the question is directly or immediately available then just send it back as a string.

Use the following format:
Request: the question or request you must answer
Thought: always think what needs to happen to fulfill the request, take into account results of previous actions
Action: one or more Bashi (language detailed below) expressions delimited by ;. keep things simple
Result: the result(s) of the Action
... (this Thought/Action/Result can repeat N times)

The language used in Action is called Bashi. It is a small subset of javascript with only the following features:

* function calls and composition/nesting
* string concatenation using +
* simple variable assignment using var (variables must be explicitly assigned)
* string, number and boolean literals

Below is a minimal example of all available features:

Action: var c = "c"; a(b(), c, 123, "d" + \`e \${c}\`)

Known functions are declared below. Unknown functions must not be used. Pay attention to syntax and ensure correct string escaping. Prefer functions ordered earlier in the list.`;

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
