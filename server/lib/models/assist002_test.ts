import { noop } from "cockatiel";
import { ChatCompletionRequestMessage } from "openai";

import { assertSnapshot } from "std/testing/snapshot.ts";
import * as fixtures from "@lib/fixtures.ts";
import { Session } from "@lib/session.ts";
import { CommandExecuted, parseExpression } from "@lib/command.ts";

import {
  MAX_MODEL_CALLS,
  Input,
  run,
  getPendingCommandsOrResult,
} from "./assist002.ts";

const pendingClientCommandState = () =>
  ({
    modelCallCount: 1,
    pending: {
      action: 'now(); getInput("what do you want?")',
      expressions: [
        { type: "call", args: [], name: "now" },
        {
          type: "call",
          args: [{ type: "string", value: "what do you want?" }],
          name: "getInput",
        },
      ],
      result: undefined,
      thought: "I need to do something",
    },
    request: "some request",
    resolvedActionGroups: [],
    resolvedCommands: [
      {
        args: [],
        id: "0",
        name: "now",
        returnValue: { type: "string", value: "2022-12-19T08:41:10.000Z" },
        type: "executed",
      },
    ],
    memory: { variables: {}, topLevelResults: [] },
  } satisfies Session["assist002State"]);

const pendingInputTextState = () =>
  ({
    modelCallCount: 1,
    pending: {
      action: 'editText(getInput("the text"), "convert to poem"); now()',
      expressions: [
        {
          type: "call",
          args: [
            {
              type: "call",
              name: "getInput",
              args: [{ type: "string", value: "the text" }],
            },
            { type: "string", value: "convert to poem" },
          ],
          name: "editText",
        },
        {
          type: "call",
          args: [],
          name: "now",
        },
      ],
      result: undefined,
      thought: "I need to do something",
    },
    request: "some request",
    resolvedActionGroups: [
      {
        action: "someCommand()",
        result: `"blah"`,
        thought: "I need to call some command",
        expressions: [
          {
            type: "call",
            args: [],
            name: "someCommand",
          },
        ],
      },
    ],
    resolvedCommands: [
      {
        type: "executed",
        args: [],
        id: "0",
        name: "someCommand",
        returnValue: { type: "string", value: "blah" },
      },
    ],
    memory: { variables: {}, topLevelResults: [] },
  } satisfies Session["assist002State"]);

for (const test of [
  {
    description: "all commands resolved on the server",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something
Action: now(); math("pi^2 + 123")`,
      `Your request has been fulfilled.`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "all commands resolved on the server - empty final response",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something
Action: now(); math("pi^2 + 123")`,
      ``,
    ],
  },
  {
    description: "empty action tries to run the model again",
    input: { request: "some request" },
    openAiResults: [`Thought: empty action\nAction: `, `I have finished`],
  },
  {
    description: "command overloads work",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something
Action: "string" + "concat"; 123 + 1`,
      `I have finished`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "infix + operand support",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something
Action: sendResponse("infix " + (currentTimeForTimezone("America/New_York") + " hello"))`,
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs with lots of newlines",
    input: { request: "some request" },
    openAiResults: [
      `Thought: \nI need to get the current time in New York, create a calendar event 5 days from now, and answer the question.\nAction: \nsendResponse("The time in New York is " + currentTimeForTimezone("America/New_York") + " and I have created a calendar event for dinner with your wife 5 days from now.");\ncreateCalendarEvent(parseRelativeTime("5 days from now"), "Dinner with wife");`,
    ],
  },
  {
    description: "supports model outputs with top level infix call",
    input: { request: "some request" },
    openAiResults: [
      "Thought: Do somethign\nAction: currentTimeForTimezone(`America/${`New_York`}`); createCalendarEvent(parseRelativeTime(`in ${5} days`), 'Dinner with Wife');",
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs using template strings",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to get the current time in New York and create a calendar event 5 days from now\nAction: now() + ' ' + currentTimeForTimezone('America/New_York'); createCalendarEvent(parseRelativeTime('in 5 days'), 'Dinner with Wife');`,
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs with top level expression",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to get the current time in New York and create a calendar event 5 days from now\nAction: "some string"; 123; currentTimeForTimezone('Pacific/Auckland')`,
      `I have finished`,
    ],
  },
  {
    description: "supports assignment",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something\nAction: a = 123; b = 111; a + b`,
      `I have finished`,
    ],
  },
  {
    description: "server commands with identical inputs re-use results",
    input: { resolvedCommands: [] },
    openAiResults: [
      `Thought: blah\nAction: now(); getInput("not reused because client command")`,
    ],
    initialState: {
      modelCallCount: 1,
      request: "some request",
      resolvedCommands: [
        {
          type: "executed",
          args: [],
          id: "someid",
          name: "now",
          returnValue: "0000-00-00T00:00:00Z",
        },
        {
          type: "executed",
          args: [
            { type: "string", value: "not reused because client command" },
          ],
          id: "someid",
          name: "getInput",
          returnValue: "this should not be reused",
        },
      ],
    },
  },
  {
    description: "client resolved command",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something
Action: now(); getInput("what do you want?")`,
    ],
  },
  {
    description: "client resolved command - continue but unresolved",
    input: {
      resolvedCommands: {},
    },
    openAiResults: [],
    initialState: pendingClientCommandState(),
  },
  {
    description: "client resolved command - wrong return type",
    input: {
      resolvedCommands: { 1: { type: "number", value: 123 } },
    },
    openAiResults: [],
    snapshotError: true,
    initialState: pendingClientCommandState(),
  },
  {
    description: "client resolved command - fulfilled",
    input: {
      resolvedCommands: { 1: { type: "string", value: "to test you" } },
    },
    openAiResults: [`I have finished`],
    snapshotPrompts: true,
    initialState: pendingClientCommandState(),
  },
  {
    description: "nested calls",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to get the current time in New York and create a calendar event 5 days from now
Action: currentTimeForTimezone("America/New_York"); createCalendarEvent(parseRelativeTime("5 days from now"), "Dinner with Wife")`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "request needs more context",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something
Action: now(); editText(getInput("the text"), "convert to poem"); now()`,
    ],
  },
  {
    description: "request needs more context - still missing",
    input: { resolvedCommands: [] },
    openAiResults: [],
    initialState: pendingInputTextState(),
  },
  {
    description: "request needs more context - wrong type",
    input: {
      resolvedCommands: {
        "1.0.0": {
          type: "number",
          value: 123,
        },
      },
    },
    openAiResults: [],
    snapshotError: true,
    initialState: pendingInputTextState(),
  },
  {
    description: "request needs more context - fulfilled",
    input: {
      resolvedCommands: {
        "1.0.0": {
          type: "string",
          value: "some text",
        },
      },
    },
    openAiResults: [`the result of editText()`, `I have finished`],
    snapshotPrompts: true,
    initialState: pendingInputTextState(),
  },
  {
    description: "fulfilled but max loops",
    input: {
      resolvedCommands: {
        "1.0.0": {
          type: "string",
          value: `some text`,
        },
      },
    },
    openAiResults: [`the result of editText()`],
    snapshotError: true,
    initialState: {
      ...pendingInputTextState(),
      modelCallCount: MAX_MODEL_CALLS,
    },
  },
  {
    description: "wrong arg type",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something
Action: now(); math(true)`,
    ],
    snapshotError: true,
  },
  {
    description: "wrong arg count",
    input: { request: "some request" },
    openAiResults: [
      `Thought: I need to do something
Action: now(); math()`,
    ],
    snapshotError: true,
  },
  {
    description: "top level commands are resolved sequentially",
    input: { request: "some request" },
    openAiResults: [
      `Thought: some thought
Action: getInput("how are you?"); currentTimeForTimezone("America/New_York")`,
    ],
  },
  {
    description: "top level commands are resolved sequentially 2",
    input: {
      resolvedCommands: {
        "0.0": { type: "string", value: "good" },
      },
    },
    openAiResults: [`I have finished`],
    initialState: {
      modelCallCount: 1,
      pending: {
        action:
          'getInput("how are you?"); currentTimeForTimezone("America/New_York")',
        expressions: [
          {
            args: [{ type: "string", value: "how are you?" }],
            name: "getInput",
            type: "call",
          },
          {
            args: [{ type: "string", value: "America/New_York" }],
            name: "currentTimeForTimezone",
            type: "call",
          },
        ],
        result: undefined,
        thought: "some thought",
      },
      request: "some request",
      resolvedActionGroups: [],
      resolvedCommands: [],
    },
  },
  {
    description: "long results are truncated and stored in variables",
    input: { request: "some request" },
    openAiResults: [
      `Thought: some thought\nAction: longVar = "${new Array(500)
        .fill("word")
        .join(" ")}"; longVar`,
      `I have finished`,
    ],
    snapshotPrompts: true,
  },
  {
    description:
      "the 'result' var name is magic and refers to the previous result if not already assigned",
    input: { request: "some request" },
    openAiResults: [
      `Thought: some thought\nAction: "hello result"`,
      `Thought: some thought\nAction: result`,
      `Thought: some thought\nAction: var a = "b"; "should override result within same action"; result`, // assignment returns void which should be ignored
      `Thought: some thought\nAction: rEsUlt`, // any case
      `Thought: some thought\nAction: var result = "new result"`, // override
      `Thought: some thought\nAction: "this should not show up twice"`,
      `Thought: some thought\nAction: result`, // should be the variable
      `Thought: some thought\nAction: "this should show up"`,
      `Thought: some thought\nAction: reSult`, // should be the result
      `I have finished`,
    ],
  },
  {
    description: "string to number and vice versa implicit conversion",
    input: { request: "some request" },
    openAiResults: [
      `Thought: some thought\nAction: math(123123)`,
      `Thought: some thought\nAction: commandWithNumberArg("123123.00")`,
      `I have finished`,
    ],
  },
] as {
  description: string;
  openAiResults?: string[];
  input: Input;
  initialState?: NonNullable<Session["assist002State"]>;
  snapshotPrompts?: true;
  snapshotError?: true;
}[]) {
  Deno.test(test.description, async (t) => {
    let n = 0;
    let session: Session = {
      ...fixtures.session,
      assist002State: test.initialState,
    };
    let prompts: ChatCompletionRequestMessage[] = [];

    const openAiClient = {
      createChatCompletion(opts: { messages: ChatCompletionRequestMessage[] }) {
        prompts = [...prompts, ...opts.messages];
        const text = (test.openAiResults ?? [])[n];
        if (text == null) {
          throw new Error(`openai mock on index ${n} not available`);
        }
        n++;
        return {
          data: {
            choices: [
              {
                message: {
                  role: "assistant",
                  content: text,
                },
              },
            ],
          },
        };
      },
      createCompletion(opts: { prompt: [string] }) {
        const text = (test.openAiResults ?? [])[n];
        if (text == null) {
          throw new Error(`openai mock on index ${n} not available`);
        }
        n++;
        return { data: { choices: [{ text }] } };
      },
    };

    try {
      const output = await run(
        {
          faultHandlingPolicy: noop,
          log: () => {},
          now: () => fixtures.now,
          openai: openAiClient as any,
          session,
          setUpdatedSession: (s) => {
            session = s;
          },
          signal: null as any,
          whisperEndpoint: null as any,
          googleSearch: async () => [],
        },
        {
          model: "assist-002",
          commands: {
            ...fixtures.assist002CommandSet,
            commandWithNumberArg: {
              args: [{ type: "number", name: "some number" }],
              description: "some fixture command",
              returnType: "void",
            },
          },
        },
        test.input
      );

      await assertSnapshot(t, {
        output,
        state: session?.assist002State,
        n,
      });

      if (test.snapshotPrompts === true) {
        await assertSnapshot(t, prompts);
      }
    } catch (e) {
      if (test.snapshotError !== true) {
        throw e;
      }

      await assertSnapshot(t, e.message);
    }
  });
}

for (const test of [
  {
    description: "example A step 1",
    commandId: "0",
    call: parseExpression(`test(a(), b(123, c()))`),
    resolvedCommands: {},
  },
  {
    description: "example A step 2",
    commandId: "0",
    call: parseExpression(`test(a(), b(123, c()))`),
    resolvedCommands: {
      "0.0": {
        type: "executed",
        args: [],
        id: "0.0",
        name: "a",
        returnValue: { type: "number", value: 123 },
      },
      "0.1.1": {
        type: "executed",
        args: [],
        id: "0.1.1",
        name: "c",
        returnValue: { type: "string", value: "blah" },
      },
    } as Record<string, CommandExecuted>,
  },
  {
    description: "example A step 3",
    commandId: "0",
    call: parseExpression(`test(a(), b(123, c()))`),
    resolvedCommands: {
      "0.0": {
        type: "executed",
        args: [],
        id: "0.0",
        name: "a",
        returnValue: { type: "number", value: 123 },
      },
      "0.1": {
        type: "executed",
        args: [],
        id: "0.1",
        name: "b",
        returnValue: { type: "string", value: "ha" },
      },
    } as Record<string, CommandExecuted>,
  },
  {
    description: "example A step 4",
    commandId: "0",
    call: parseExpression(`test(a(), b(123, c()))`),
    resolvedCommands: {
      "0": {
        type: "executed",
        args: [],
        id: "0",
        name: "test",
        returnValue: { type: "number", value: 123 },
      },
    } as Record<string, CommandExecuted>,
  },
]) {
  Deno.test(test.description, async (t) => {
    try {
      await assertSnapshot(
        t,
        getPendingCommandsOrResult(
          test.commandId,
          test.call,
          test.resolvedCommands
        )
      );
    } catch (e) {
      await assertSnapshot(t, e.message);
    }
  });
}
