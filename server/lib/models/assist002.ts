// @deno-types="@/types/gpt-3-encoder.d.ts"
import * as gptEncoder from "gpt-3-encoder";
import * as t from "io-ts";
import * as p from "typescript-parsec";

import {
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
} from "openai";

import {
  Input,
  ResultPendingCommands,
  languageBuiltinCommands,
  getPendingCommandsOrResult,
} from "./assistShared.ts";

import { ModelDeps } from "./modelDeps.ts";
import { IS_DEV } from "@lib/constants.ts";
import { wrap } from "@lib/log.ts";
import { HTTPError } from "@lib/errors.ts";
import { Value, valueToString } from "@lib/valueTypes.ts";

import {
  Memory,
  Expr,
  AnyBuiltinCommandDefinition,
  CommandSet,
  CommandParsed,
  CommandExecuted,
  builtinCommands,
  filterUnnecessary,
  runBuiltinCommand,
} from "@lib/command.ts";

import { Session } from "@lib/session.ts";

import {
  T,
  STATEMENTS,
  TEMPLATE_STRING,
  lexer,
  parsePredicate,
} from "@lib/command/parser.ts";

const RESPOND_COMMAND = "respond";

const Action = t.intersection([
  t.type({
    action: t.string,
    expressions: t.array(Expr),
  }),
  t.partial({
    result: t.string,
  }),
]);
type Action = t.TypeOf<typeof Action>;

export const State = t.type({
  request: t.string,
  modelCallCount: t.number,
  resolvedActions: t.array(
    t.intersection([
      Action,
      t.type({
        result: t.string,
      }),
    ])
  ),
  resolvedCommands: t.array(CommandExecuted),
  pending: t.array(Action),
  memory: Memory,
});
export type State = t.TypeOf<typeof State>;

export const MAX_LOOPS = 500;
export const MAX_MODEL_CALLS = 10;

export const Name = t.literal("assist-002");
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
  result: ResultPendingCommands,
});
export type Output = t.TypeOf<typeof Output> & {
  dev?: {
    results: string[];
    messages: (ChatCompletionRequestMessage | ChatCompletionResponseMessage)[];
  };
};

export const defaultConfiguration: Partial<Configuration> = {
  model: "assist-002",
};

const serverCommands = {
  ...builtinCommands,
  ...languageBuiltinCommands,
} as Record<
  string,
  | AnyBuiltinCommandDefinition
  | {
      overloads: AnyBuiltinCommandDefinition[];
    }
>;

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

  if (!(RESPOND_COMMAND in clientCommands)) {
    throw new HTTPError(
      `the '${RESPOND_COMMAND}' client command must be made available`,
      400
    );
  }
  if (clientCommands[RESPOND_COMMAND]!.returnType !== "string") {
    throw new HTTPError(
      `the '${RESPOND_COMMAND}' client command must return a string (indicating the users next message)`,
      400
    );
  }

  let dev: Output["dev"] = IS_DEV() ? { messages: [], results: [] } : undefined;

  const session = modelDeps.session;
  const isContinue = input.request == null;
  const state = isContinue ? session.assist002State : undefined;
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
  let pending = state?.pending ?? [];
  let resolvedCommands = state?.resolvedCommands ?? [];
  let resolvedActions = state?.resolvedActions ?? [];

  const resolvedCommandsDict = (): Record<string, CommandExecuted> =>
    resolvedCommands.reduce((a, e) => ({ ...a, [e.id]: e }), {});

  // todo: the following missing value literal expressions:
  const topLevelResults = (): Value[] =>
    memory.topLevelResults.filter((r) => r.type !== "void");

  // Interpreter loop that does the following:
  //
  // 1. For each pending action, find commands and try to resolve them
  //   1a. If the client provided any resolutions, use them
  //   1b. Any commands that can be resolved server side should be
  //   1c. Some commands may need a redirection to the client
  // 2. Any resolutions from the above go into the new prompt
  // 3. Plugs the prompt into the model to ask for actions to take
  // 4. Parse the completion into pending actions
  // 5. Update state with the current results, exit if the model is sending a response to the user, otherwise goto (1)

  try {
    let loopNumber = 0;
    commandResolutionLoop: while (true) {
      if (loopNumber >= MAX_LOOPS)
        throw new Error(`max loops of ${MAX_LOOPS} reached`);
      loopNumber++;
      // 1. For each pending action, find expressions and try to resolve them
      if (pending.length > 0) {
        const pendingAction = pending[0]!;
        const actionsSoFar = resolvedActions.length;
        const expressionsSoFar = resolvedActions.reduce(
          (a, g) => a + g.expressions.length,
          0
        );
        const currentActionExpressions = pendingAction.expressions;
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
            model: "assist-002",
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
                " [... truncated: full value available in variable `" +
                varName +
                "`]";
            }
          } catch {}
          resultStrings.push(resultStr);
        }
        const result = resultStrings.join("; ");
        resolvedActions.push({ ...pendingAction, result });
        dev?.results.push(result);
        if (IS_DEV()) {
          log("info", `result: ${result}`);
        }

        pending.shift();
        continue commandResolutionLoop;
      }

      // Reaching here implies that anything pending has been
      // dealt with and we are ready for more model output:

      if (modelCallCount >= MAX_MODEL_CALLS) {
        throw new HTTPError(
          `max iteration count of ${MAX_MODEL_CALLS} reached`,
          400
        );
      }
      modelCallCount++;

      // 3. Plugs the prompt into the model to ask for actions to take
      const messages = makePromptMessages(
        session,
        {
          ...clientCommands,
          ...builtinCommands,
        },
        request,
        resolvedActions
      );

      const completion = await modelDeps.openai.createChatCompletion(
        {
          messages,
          model: "gpt-3.5-turbo",
          // TODO return error if completion tokens has reached this limit
          max_tokens: session.configuration.maxResponseTokens,
          temperature: 0.3,
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
      const responseMessage = completion.data.choices[0]?.message;
      let text = responseMessage?.content ?? "";

      if (IS_DEV()) {
        log("info", `completion: ${text}`);
      }

      if (dev != null) {
        dev.messages = [...messages];
        if (responseMessage != null) {
          dev.messages.push(responseMessage);
        }
      }

      // 4. Parse the completion into pending actions
      // 5. Update state with the current results, exit if we have reached a sink,
      //    otherwise goto (1)
      pending = [...pending, ...parseCompletion(text)];
    }
  } catch (e) {
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
          dev?.messages
        )}`
      );
    }
    throw e;
  } finally {
    modelDeps.setUpdatedSession({
      ...session,
      assist002State: {
        memory,
        modelCallCount,
        request,
        pending: pending ?? null,
        resolvedActions,
        resolvedCommands,
      },
    });
  }
}

function makePromptMessages(
  session: Session,
  commands: CommandSet,
  request: string,
  resolvedActions: State["resolvedActions"]
): ChatCompletionRequestMessage[] {
  const header = `Act as an AI assistant and fulfill the request as best you can. Do not make things up. Use functions/tools (documented below) to help with this, but always prefer responding directly if knowledge is readily available and accurate. If the request cannot be fulfilled using a combination of existing knowledge and functions then let the user know why, do not make things up.

Run{} blocks must be used to call functions. They must be included in the beginning before your response to the user which should be in plain language. For example:

  Run { exampleFunction("arg 1", arg2, 123, true); }
  I have completed your request

Note that Run{} blocks and their results are not visible to the user. In addition, the user is unable to call functions themselves. So do not assume that the user knows about functions or Run{} blocks.

It is possible to assign the result of a function to a variable, and use it later via string interpolation or as inputs into other functions:

  Run { a = exampleFn("arg 1", arg2) }
  Run { b = exampleFn2(a) }
  The answer to your question is \${b}

Use functions sparingly and do not assume any other features exist beyond what is referenced above.

Known functions are declared below. Unknown functions MUST NOT be used. Pay attention to syntax and ensure correct string escaping. Prefer using functions ordered earlier in the list.`;

  const commandSet = makeCommandSet(
    filterUnnecessary(
      request + " " + resolvedActions.map((g) => `${g.action} ${g.result}`),
      commands
    )
  ).join("\n");

  return [
    {
      role: "system",
      content: `User information:
Timezone: ${JSON.stringify(session.configuration.timezoneName)}
Locale: ${JSON.stringify(session.configuration.locale)}`,
    },
    { role: "system", content: `${header}\n\n${commandSet}` },
    { role: "user", content: request },
    ...resolvedActions
      .map((g): ChatCompletionRequestMessage[] => {
        if (g.expressions.length === 1) {
          const firstExpr = g.expressions[0]!;
          if (firstExpr.type === "call" && firstExpr.name === RESPOND_COMMAND) {
            let result: ChatCompletionRequestMessage[] = [
              {
                role: "assistant",
                content:
                  firstExpr.args[0]?.type === "string"
                    ? firstExpr.args[0]!.value
                    : "",
              },
            ];
            if (g.result != null) {
              result.push({
                role: "user",
                content: g.result,
                name: "User",
              });
            }
            return result;
          }
        }
        return [
          {
            role: "assistant",
            content: g.action,
          },
          {
            role: "system",
            content: `Result: ${g.result}`,
          },
        ];
      })
      .reduce((a, messages) => [...a, ...messages], []),
  ];
}

function makeCommandSet(commands: CommandSet): string[] {
  return (
    Object.entries(commands)
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
      // Prefer the model to send plain messages for responses:
      .filter(([name]) => name !== RESPOND_COMMAND)
      .map(([name, c]) => {
        const args = c.args.map(
          (a) => `${a.name.includes(" ") ? `"${a.name}"` : a.name}: ${a.type}`
        );
        return `\`${name}(${args.join(", ")}): ${c.returnType}\` - ${
          c.description
        }`;
      })
  );
}

export function parseCompletion(completion: string): Action[] {
  const input = completion.trim();
  const str = p.apply(p.rep_sc(parsePredicate((t) => t.text !== "\n")), (xs) =>
    xs
      .map((x) => x.text)
      .join("")
      .trim()
  );
  const action = p.apply(
    p.kmid(
      p.seq(
        parsePredicate((t) => t.text.toLowerCase() === "run"),
        p.rep_sc(p.str(" ")),
        p.str("{")
      ),
      p.kmid(p.rep_sc(p.tok(T.Space)), STATEMENTS, p.rep_sc(p.tok(T.Space))),
      p.str("}")
    ),
    (expressions, tokenRange): Action => {
      return {
        action: p.extractByTokenRange(input, tokenRange[0], tokenRange[1]),
        expressions,
      };
    }
  );
  const list = p.list(
    p.apply(p.amb(p.alt(action, str)), (candidates) => {
      // Always prefer the action if it parses correctly:
      for (const c of candidates) {
        if (typeof c !== "string") return c;
      }
      return candidates[0] ?? "";
    }),
    p.seq(
      p.rep_sc(p.str(" ")),
      p.seq(p.str("\n"), p.rep_sc(p.str("\n"))),
      p.rep_sc(p.str(" "))
    )
  );

  const result = list.parse(lexer.parse(input));

  if (result.successful !== true) {
    throw result.error;
  }

  let candidates = result.candidates
    // Only consider candidates that have consumed to the EOF
    .filter((c) => c.nextToken == null)
    .map((c) => c.result);

  if (candidates.length === 0) {
    // TODO: better error:
    throw new Error(`expect to have at least 1 candidate after parsing`);
  }

  // Choose the candidate with the most number of actions:
  let bestCandidate = candidates[0]!;
  let bestCandidateActionsCount = bestCandidate.filter(
    (c) => typeof c !== "string"
  ).length;
  for (const c of candidates) {
    const actionsCount = c.filter((c) => typeof c !== "string").length;
    if (actionsCount > bestCandidateActionsCount) {
      bestCandidate = c;
      bestCandidateActionsCount = actionsCount;
    }
  }

  let actions: Action[] = [];
  let strings: string[] = [];

  for (const item of bestCandidate) {
    if (typeof item === "string") {
      strings.push(item);
    } else {
      actions.push(item);
    }
  }

  // Always process actions first and ignore string responses.
  // This gives the model more to work with (action results)
  if (actions.length > 0) {
    return actions;
  }

  // Strings get joined together and placed as an action at the end.
  if (strings.length > 0) {
    let value = strings.join("\n").trim();
    if (value !== "") {
      let arg: Expr = { type: "string", value };
      // try to apply string interpolation:
      try {
        arg = p.expectSingleResult(
          p.expectEOF(
            TEMPLATE_STRING.parse(
              lexer.parse("`" + value.replace("`", "\\`") + "`")
            )
          )
        );
      } catch {
        // TODO return error so the model can fix itself
      }
      actions.push({
        action: `${RESPOND_COMMAND}(<truncated text>)`,
        expressions: [
          {
            name: RESPOND_COMMAND,
            type: "call",
            args: [arg],
          },
        ],
      });
    }
  }

  return actions;
}
