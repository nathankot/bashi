// @deno-types="@/types/gpt-3-encoder.d.ts"
import * as gptEncoder from "gpt-3-encoder";
import * as t from "io-ts";
import * as p from "typescript-parsec";

import {
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
} from "openai";

import { Input, ResultPendingCommands } from "./assistShared.ts";

import { ModelDeps } from "./modelDeps.ts";
import { IS_DEV } from "@lib/constants.ts";
import { wrap } from "@lib/log.ts";
import { HTTPError } from "@lib/errors.ts";
import { Value, valueToString } from "@lib/valueTypes.ts";

import {
  Memory,
  Expr,
  AnyBuiltinCommandDefinition,
  CommandDefinition,
  CommandSet,
  CommandParsed,
  CommandExecuted,
  resolveExpression,
  builtinCommands,
  languageCommands,
  filterUnnecessary,
  runBuiltinCommand,
} from "@lib/command.ts";

import { Session } from "@lib/session.ts";

import {
  T,
  STATEMENT,
  TEMPLATE_STRING,
  lexer,
  parsePredicate,
} from "@lib/command/parser.ts";

const RESPOND_COMMAND = "respond";
const BLOCK_PREFIX = "run";
const COMPLETION_OPTIONS: Omit<CreateChatCompletionRequest, "messages"> = {
  model: "gpt-3.5-turbo",
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
};

const Action = t.intersection([
  t.type({
    action: t.string,
    statement: Expr,
  }),
  t.partial({
    result: t.string,
    isRespond: t.boolean,
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
  ...languageCommands,
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
  let pendingActions = state?.pending ?? [];
  let resolvedCommands = state?.resolvedCommands ?? [];
  let resolvedActions = state?.resolvedActions ?? [];

  const resolvedCommandsDict = (): Record<string, CommandExecuted> =>
    resolvedCommands.reduce((a, e) => ({ ...a, [e.id]: e }), {});

  // todo: the following missing value literal expressions:
  const topLevelResults = (): Value[] =>
    memory.topLevelResults.filter((r) => r.type !== "void");

  try {
    let loopNumber = 0;
    // 1. (interpreterLoop) While there are pending actions (Run{} blocks or string responses):
    //   1.1. Parse the action statement/expression
    //     1.2 Is the statement fully resolved?
    //       Yes: store the result
    //       No: queue the commands (functions) that need to be resolved and break to 1.3
    //   1.3. (currentActionCommandLoop) While there are pending commands:
    //     1.3.1. If the command can be resolved on the server, execute and store the result
    //     1.3.2. If the command must be resolved on the client, check has the command resolution already been provided?
    //       Yes: store the result
    //       No: return the command to the client. On callback we will start from 1.
    //     1.3.3 [catch] handle command resolution errors by resolving the action as an error, goto 1
    //   1.4. Store the result of the fully resolved action
    //   1.5. If there are no more pending actions, break to 2.
    //   1.6. Ask model for a new completion
    //     2.1. parse the completion into a list of new actions and add them to the pending actions list
    //     2.2. [catch] handle comletion parse errors by resolving the action as an error, goto 1
    //     2.2. goto 1.
    interpreterLoop: while (true) {
      if (loopNumber >= MAX_LOOPS)
        throw new Error(`max loops of ${MAX_LOOPS} reached`);
      loopNumber++;

      if (pendingActions.length > 0) {
        const pendingAction = pendingActions[0]!;
        const resolvedActionsCount = resolvedActions.length;
        const currentActionExpr = pendingAction.statement;
        let currentActionResult: Value | null = null;
        // Get the first top level call that is still pending, we want
        // to handle each top level call in sequence.
        let currentActionPendingCommands: CommandParsed[] = [];
        const pendingCommandsOrResult = resolveExpression(
          `${resolvedActionsCount}`,
          currentActionExpr,
          resolvedCommandsDict()
        );
        if ("result" in pendingCommandsOrResult) {
          currentActionResult = pendingCommandsOrResult.result;
          // Update top level results in memory:
          memory.topLevelResults[resolvedActionsCount] = currentActionResult;
        } else if ("pendingCommands" in pendingCommandsOrResult) {
          currentActionPendingCommands =
            pendingCommandsOrResult.pendingCommands;
        }

        let commandsToSendToClient: CommandParsed[] = [];
        currentActionCommandLoop: for (let pendingCommand of currentActionPendingCommands) {
          const commandName = pendingCommand.name;
          const clientCommandDef = clientCommands[commandName];
          const serverCommandDef = serverCommands[commandName];
          if (clientCommandDef == null && serverCommandDef == null) {
            throw new Error(`the command ${commandName} is unknown`);
          }

          // For commands that are not overloaded, try type coercion,
          pendingCommand = tryTypeCoercion(
            (serverCommandDef != null && !("overloads" in serverCommandDef)
              ? serverCommandDef
              : clientCommandDef) ?? null,
            pendingCommand
          );

          if (serverCommandDef != null) {
            // If the command is not a language command and was already previously
            // run with identical arguments, then re-use the return value.
            const reused = tryReuseResolvedCommand(
              resolvedCommands,
              pendingCommand
            );
            if (reused != null) {
              resolvedCommands.push(reused);
              continue currentActionCommandLoop;
            }

            const resolved = await runBuiltinCommand(
              serverCommandDef,
              modelDeps,
              pendingCommand,
              memory
            );
            resolvedCommands.push(resolved);
            continue currentActionCommandLoop;
          } else if (clientCommandDef != null) {
            const maybeClientResolution =
              input.resolvedCommands == null
                ? null
                : input.resolvedCommands[pendingCommand.id.toString()];
            if (maybeClientResolution) {
              if (
                maybeClientResolution.type !== "error" &&
                clientCommandDef.returnType !== maybeClientResolution.type
              ) {
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
              continue currentActionCommandLoop;
            }
            commandsToSendToClient.push(pendingCommand);
          }
        }

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

        // Go through the loop again if we have not resolved the current action.
        if (currentActionResult == null) {
          continue interpreterLoop;
        }

        const { result, storeActionResultInMemory } = renderActionResult(
          resolvedActionsCount,
          currentActionResult
        );
        storeActionResultInMemory(memory);
        resolvedActions.push({ ...pendingAction, result });
        dev?.results.push(result);
        if (IS_DEV()) {
          log("info", `result: ${result}`);
        }

        pendingActions.shift();
        continue interpreterLoop;
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
          // TODO return error if completion tokens has reached this limit
          max_tokens: session.configuration.maxResponseTokens,
          ...COMPLETION_OPTIONS,
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

      pendingActions = [...pendingActions, ...parseCompletion(text)];
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
        pending: pendingActions ?? null,
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

Run{} blocks must be used to call functions. They must be included in the beginning before your response to the user which should be in plain language. Run blocks must only include a single statement. For example:

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
        return [
          {
            role: "assistant",
            content: g.action,
          },
          g.isRespond === true
            ? {
                role: "user",
                content: JSON.parse(g.result) as string,
                name: "User",
              }
            : {
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
  const str: p.Parser<T, string> = p.apply(
    p.rep_sc(parsePredicate((t) => t.text !== "\n")),
    (xs) =>
      xs
        .map((x) => x.text)
        .join("")
        .trim()
  );
  const action: p.Parser<T, Action> = p.apply(
    p.kmid(
      p.seq(
        parsePredicate((t) => t.text.toLowerCase() === BLOCK_PREFIX),
        p.rep_sc(p.str(" ")),
        p.str("{")
      ),
      p.kmid(p.rep_sc(p.tok(T.Space)), STATEMENT, p.rep_sc(p.tok(T.Space))),
      p.str("}")
    ),
    (statement, tokenRange): Action => {
      return {
        action: p.extractByTokenRange(input, tokenRange[0], tokenRange[1]),
        statement,
      };
    }
  );
  const list = p.list(
    {
      parse(token: p.Token<T> | undefined): p.ParserOutput<T, string | Action> {
        // First try to parse as an action.
        const r = action.parse(token);
        // Return the result if:
        // * the action is successful
        // * the action errors, but it has an action block prefix
        if (r.successful) return r;
        const errorIndex = (r.error.pos?.index ?? 0) - (token?.pos?.index ?? 0);
        if (errorIndex >= `${BLOCK_PREFIX}{`.length) return r;
        // Lastly just parse it as a string:
        return str.parse(token);
      },
    },
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
        action: value,
        isRespond: true,
        statement: {
          name: RESPOND_COMMAND,
          type: "call",
          args: [arg],
        },
      });
    }
  }

  return actions;
}

function tryTypeCoercion(
  commandDef: Pick<CommandDefinition, "args"> | null,
  pendingCommand: CommandParsed
): CommandParsed {
  // the following is supported:
  //
  // number -> string
  // number -> boolean
  // string -> number
  if (commandDef == null) return pendingCommand;
  let args = [...pendingCommand.args];
  for (const [i, argDef] of commandDef.args.entries()) {
    const a = args[i];
    if (a == null) break;
    if (a.type === argDef.type) continue;
    if (a.type === "number" && argDef.type === "string") {
      args[i] = { type: "string", value: `${a.value}` };
    }
    if (a.type === "number" && argDef.type === "boolean") {
      args[i] = { type: "boolean", value: a.value === 1 };
    }
    if (a.type === "string" && argDef.type === "number") {
      const parsed = parseInt(a.value, 10);
      if (!isNaN(parsed)) {
        args[i] = { type: "number", value: parsed };
      }
    }
  }
  return { ...pendingCommand, args };
}

function tryReuseResolvedCommand(
  resolvedCommands: CommandExecuted[],
  pendingCommand: CommandParsed
): CommandExecuted | null {
  for (const resolved of resolvedCommands) {
    if (resolved.name in languageCommands) continue;
    if (resolved.name !== pendingCommand.name) continue;
    if (
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
      return { ...resolved, id: pendingCommand.id };
    }
  }
  return null;
}

function renderActionResult(
  actionIndex: number,
  result: Value
): {
  result: string;
  storeActionResultInMemory: (m: Memory) => void;
} {
  const varName = `result_${actionIndex}`;
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

  return {
    result: resultStr,
    storeActionResultInMemory: (memory) => {
      if (result.type === "error") return;
      if (memory.variables[varName] != null) return;
      memory.variables[varName] = result;
    },
  };
}
