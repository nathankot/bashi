// @deno-types="@/types/gpt-3-encoder.d.ts"
import * as gptEncoder from "gpt-3-encoder";
import * as t from "io-ts";
import * as p from "typescript-parsec";

import { IS_DEV } from "@lib/constants.ts";
import { ModelDeps } from "./modelDeps.ts";
import { wrap } from "@lib/log.ts";
import { HTTPError } from "@lib/errors.ts";
import { Value, valueToString } from "@lib/valueTypes.ts";

import {
  Input,
  Result,
  languageBuiltinCommands,
  getPendingCommandsOrResult,
} from "./assistShared.ts";

import {
  Memory,
  Expr,
  AnyBuiltinCommandDefinition,
  BuiltinCommandDefinition,
  CommandSet,
  CommandParsed,
  CommandExecuted,
  builtinCommands,
  filterUnnecessary,
  parseStatements,
  runBuiltinCommand,
} from "@lib/command.ts";

const ActionGroup = t.intersection([
  t.type({
    thought: t.string,
    action: t.string,
    expressions: t.array(Expr),
  }),
  t.partial({
    result: t.string,
  }),
]);
type ActionGroup = t.TypeOf<typeof ActionGroup>;

enum T {
  KeywordThought,
  KeywordAction,
  KeywordResult,

  Char,
  Newline,
}

const actionLexer = p.buildLexer([
  [true, /^\n( *?)Thought( *?):/gi, T.KeywordThought],
  [true, /^\n( *?)Action( *?):/gi, T.KeywordAction],
  [true, /^\n( *?)Result( *?):/gi, T.KeywordResult],
  [true, /^\n/g, T.Newline],
  [true, /^./g, T.Char],
]);

const STRING = p.rule<T, string>();
STRING.setPattern(
  p.lrec_sc(
    p.apply(p.alt(p.tok(T.Char), p.tok(T.Newline)), (c) => c.text),
    p.alt(p.tok(T.Char), p.tok(T.Newline)),
    (c1, c2) => c1 + c2.text
  )
);

const ACTION_GROUP = p.rule<T, ActionGroup>();
ACTION_GROUP.setPattern(
  p.apply(
    p.seq(
      p.apply(p.kright(p.tok(T.KeywordThought), STRING), (str) => str.trim()),
      p.apply(
        p.kright(p.tok(T.KeywordAction), p.opt_sc(STRING)),
        (str) => str?.trim() ?? ""
      ),
      p.opt_sc(
        p.apply(p.kright(p.tok(T.KeywordResult), p.opt_sc(STRING)), (str) => {
          const result = str != null ? str.trim() : "";
          if (result.length === 0) {
            return undefined;
          }
          return result;
        })
      )
    ),
    ([thought, action, result]) => {
      const expressions = parseStatements(action);
      return {
        thought,
        action,
        result,
        expressions,
      };
    }
  )
);

export function parseActionGroup(expr: string): ActionGroup {
  return p.expectSingleResult(
    p.expectEOF(
      ACTION_GROUP.parse(
        // Inject a newline so that the lexer can disambiguate between
        // a leading Thought: vs a Thought: inside some contents.
        actionLexer.parse(expr[0] !== "\n" ? "\n" + expr : expr)
      )
    )
  );
}

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
export const MAX_MODEL_CALLS = 10;

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
  result: Result,
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
  let memory: Memory = {
    variables: { ...state?.memory?.variables },
    topLevelResults: [...(state?.memory?.topLevelResults ?? [])],
  };

  let modelCallCount = state?.modelCallCount ?? 0;
  let pending = state?.pending;
  let resolvedCommands = state?.resolvedCommands ?? [];
  let resolvedActionGroups = state?.resolvedActionGroups ?? [];

  const resolvedCommandsDict = (): Record<string, CommandExecuted> =>
    resolvedCommands.reduce((a, e) => ({ ...a, [e.id]: e }), {});

  // todo: the following missing value literal expressions:
  const topLevelResults = (): Value[] =>
    memory.topLevelResults.filter((r) => r.type !== "void");

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
        const actionsSoFar = resolvedActionGroups.length;
        const expressionsSoFar = resolvedActionGroups.reduce(
          (a, g) => a + g.expressions.length,
          0
        );
        const currentActionExpressions = pending.expressions;
        // Get the first top level call that is still pending, we want
        // to handle each top level call in sequence.
        let pendingCommands: CommandParsed[] = [];
        let currentActionTopLevelResults: Value[] = [];
        for (const [i, expr] of currentActionExpressions.entries()) {
          const pendingCommandsOrResult = getPendingCommandsOrResult(
            `${actionsSoFar}.${i}`,
            expr,
            resolvedCommandsDict()
          );
          if ("result" in pendingCommandsOrResult) {
            currentActionTopLevelResults.push(pendingCommandsOrResult.result);
            // Update top level results in memory:
            memory.topLevelResults[expressionsSoFar + i] =
              pendingCommandsOrResult.result;
          } else if ("pendingCommands" in pendingCommandsOrResult) {
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

          // For commands that are not overloaded, try type coercion,
          // the following is supported:
          //
          // number -> string
          // number -> boolean
          // string -> number
          const notOverloadedCommand =
            serverCommandDef != null && "overloads" in serverCommandDef
              ? null
              : serverCommandDef ?? clientCommandDef;
          if (notOverloadedCommand != null) {
            for (const [i, argDef] of notOverloadedCommand.args.entries()) {
              const a = pendingCommand.args[i];
              if (a == null) break;
              if (a.type === argDef.type) continue;
              if (a.type === "number" && argDef.type === "string") {
                pendingCommand.args[i] = {
                  type: "string",
                  value: `${a.value}`,
                };
              }
              if (a.type === "number" && argDef.type === "boolean") {
                pendingCommand.args[i] = {
                  type: "boolean",
                  value: a.value === 1,
                };
              }
              if (a.type === "string" && argDef.type === "number") {
                const parsed = parseInt(a.value, 10);
                if (!isNaN(parsed)) {
                  pendingCommand.args[i] = { type: "number", value: parsed };
                }
              }
            }
          }

          if (serverCommandDef != null) {
            // 1b. Any commands that can be resolved server side should be

            // If the command is not a language command and was already previously
            // run with identical arguments, then re-use the return value.
            for (const resolved of resolvedCommands) {
              if (
                !(resolved.name in languageBuiltinCommands) &&
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
              results: topLevelResults(),
            },
            dev,
          };
        }

        // Go through the loop again if we have not resolved all top-level commands:
        if (
          currentActionTopLevelResults.length !==
          currentActionExpressions.length
        ) {
          continue commandResolutionLoop;
        }

        // 2. Any resolutions from the above go into the new prompt
        let resultStrings = [];
        for (const [i, result] of currentActionTopLevelResults.entries()) {
          const varName = `result_${actionsSoFar}_${i}`;
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
        for (const topLevelExpr of currentActionExpressions) {
          if (topLevelExpr.type !== "call") {
            continue;
          }
          if (sinks[topLevelExpr.name] === true) {
            isFinished = true;
          }
        }
        // Mark as finished if top level commands were empty (implicit finish):
        if (currentActionExpressions.length === 0) {
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
            1640: -1, // `for` - try reduce tendency of the model to use for loops
            11018: -1, // `math` - the LLM has a tendency to throw arbitrary expressions in here
            7785: 1, // `var`
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
        `got openAI error, response status was: ${
          e.response.status
        }, response data: \n${JSON.stringify(e.response.data)}`
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
      results: topLevelResults(),
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
Action: one or more Bashi (language detailed below) expressions delimited by ; carefully ensure the expressions are correct and all referenced variables were previously assigned
Result: the result(s) of the Action
... (this Thought/Action/Result can repeat N times)

The language used in Action is called Bashi. It is a small subset of javascript with only the following features:
* function calls and composition/nesting, results can be assigned to variables
* string concatenation using +
* simple variable assignment using var
* reference to previously assigned variables
* string, number and boolean literals

Below is a minimal example of all available features:
Action: var c = "c"; a(b(), c, 123, "d" + \`e \${c}\`)

Known functions are declared below in a typescript-like notation. Unknown functions must not be used. Pay attention to syntax and ensure correct string escaping. Prefer functions ordered earlier in the list.`;

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
