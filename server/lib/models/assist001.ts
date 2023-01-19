import * as t from "io-ts";

import {
  CommandSet,
  Command,
  BuiltinCommandDefinition,
  builtinCommands,
  filterUnnecessary,
  parseCommand,
  checkRequestContext,
  runBuiltinCommand,
} from "@lib/command.ts";

import { HTTPError } from "@lib/errors.ts";
import { RequestContext } from "@lib/requestContext.ts";
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
    returnType: "null",
  } as BuiltinCommandDefinition<["string"], "null">,

  answer: {
    description:
      "answer the original question directly based on existing knowledge. this is preferred",
    args: [
      {
        name: "answer",
        type: "string",
      },
    ],
    run: async (_, __, [answer]) => ({ type: "null" }),
    returnType: "null",
  } as BuiltinCommandDefinition<["string"], "null">,

  now: {
    description: "get the current time in ISO8601 format",
    args: [],
    run: async (_, __, []) => ({
      type: "string",
      value: new Date().toISOString(),
    }),
    returnType: "string",
  } as BuiltinCommandDefinition<[], "string">,
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
    pendingAssistRequest?.scratch + `\nThought:` ??
    (request != null ? `Begin!\n\nRequest: ${request.trim()}\nThought:` : null);

  if (beginSection == null || request == null) {
    throw new HTTPError(
      "no request could be found, either in the 'request' field, " +
        " or in a pending request",
      400
    );
  }

  let isFinished = false;
  let commands = pendingAssistRequest?.commands ?? [];
  let pendingActions = pendingAssistRequest?.pendingActions ?? [];

  const maxLoops = 5; // TODO turn into config
  let n = pendingAssistRequest?.loopCount ?? 0;
  let scratch = beginSection;

  try {
    // Interpreter loop that does the following:
    //
    // 1. Plugs the prompt into the model to ask for thought/actions to take
    // 2. Parse the completion into pending thought/actions
    // 3. For each pending thought/action, evaluate into a command result
    //   3a. This evaluation may involve a redirection to the client, in order to evaluate
    //       commands that need to happen there.
    // 4. Update state with the current results, exit if we have reached a sink, otherwise goto (1)
    //    with results added to the prompt
    while (true) {
      if (isFinished) {
        break;
      }

      if (n >= maxLoops) {
        throw new HTTPError(`max iteration count of ${maxLoops} reached`, 400);
      }
      n++;

      const serverCommands = {
        ...builtinCommands,
        ...privateCommands,
      };

      const commandSet = filterUnnecessary(scratch, {
        ...configuration.commands,
        ...serverCommands,
      });

      const prompt = makePrompt(commandSet, scratch);

      console.log("NKDEBUG prompt is", prompt);

      // 1. Plugs the prompt into the model to ask for thought/actions to take
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
      let thought = "";
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
            pendingActions.push(parsed);
          }
        }
      }

      if (pendingActions.length === 0) {
        isFinished = true;
        continue;
      }

      for (const command of pendingActions) {
        if (command.type === "executed") {
          commands.push(command);
          continue;
        }

        if (command.type === "parse_error" || command.type === "invalid") {
          log(
            "error",
            `failed command interpretation: ${JSON.stringify(command)}`
          );
          throw new HTTPError("could not interpret model result", 400);
        }

        const commandName = command.name;
        if (!isBuiltinCommand(commandName)) {
          continue;
        }

        const commandDef = serverCommands[commandName];

        const missingRequestContext = checkRequestContext(
          commandDef,
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

        commands[i] = await runBuiltinCommand(
          commandDef,
          modelDeps,
          input,
          command
        );
      }

      // TODO: update scratch with actions/results
      // reset pending actions,
      // update commands
      commands = [...commands, ...pendingActions];
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
    return `\`${name}(${args.join(", ")}) => ${c.returnType}\` - ${
      c.description
    }`;
  });
}
