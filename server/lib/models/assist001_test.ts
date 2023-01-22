import { noop } from "cockatiel";

import { assertSnapshot } from "std/testing/snapshot.ts";
import * as fixtures from "@lib/fixtures.ts";
import { Session } from "@lib/session.ts";
import { CommandExecuted, parseFunctionCall } from "@lib/command.ts";

import {
  MAX_MODEL_CALLS,
  Input,
  run,
  getPendingCommandsOrResult,
} from "./assist001.ts";

const pendingClientCommandState = {
  modelCallCount: 1,
  pending: {
    action: 'now(); ask("what do you want?")',
    functionCalls: [
      { type: "call", args: [], name: "now" },
      {
        type: "call",
        args: [{ type: "string", value: "what do you want?" }],
        name: "ask",
      },
    ],
    result: undefined,
    thought: "I need to do something",
  },
  request: "some request",
  requestContext: {},
  resolvedActionGroups: [],
  resolvedCommands: {
    "0.0": {
      args: [],
      id: "0",
      name: "now",
      returnValue: { type: "string", value: "2022-12-19T08:41:10.000Z" },
      type: "executed",
    },
  },
} satisfies Session["assist001State"];

const pendingRequestContextState = {
  modelCallCount: 1,
  pending: {
    action: 'editProse("convert to poem"); now()',
    functionCalls: [
      {
        type: "call",
        args: [{ type: "string", value: "convert to poem" }],
        name: "editProse",
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
  requestContext: {},
  resolvedActionGroups: [
    {
      action: "someCommand()",
      result: `"blah"`,
      thought: "I need to call some command",
      functionCalls: [
        {
          type: "call",
          args: [],
          name: "someCommand",
        },
      ],
    },
  ],
  resolvedCommands: {
    "0.0": {
      type: "executed",
      args: [],
      id: "0",
      name: "someCommand",
      returnValue: { type: "string", value: "blah" },
    },
  },
} satisfies Session["assist001State"];

for (const test of [
  {
    description: "all commands resolved on the server",
    input: { request: "some request" },
    openAiResults: [
      `I need to do something
Action: now(); math("pi^2 + 123")`,
      `I have finished
Action: finish()`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "all commands resolved on the server - implicit finish",
    input: { request: "some request" },
    openAiResults: [
      `I need to do something
Action: now(); math("pi^2 + 123")`,
      ``,
    ],
  },
  {
    description: "client resolved command",
    input: { request: "some request" },
    openAiResults: [
      `I need to do something
Action: now(); ask("what do you want?")`,
    ],
  },
  {
    description: "client resolved command - continue but unresolved",
    input: {
      resolvedCommands: {},
    },
    openAiResults: [],
    initialState: pendingClientCommandState,
  },
  {
    description: "client resolved command - wrong return type",
    input: {
      resolvedCommands: { 1: { type: "number", value: 123 } },
    },
    openAiResults: [],
    snapshotError: true,
    initialState: pendingClientCommandState,
  },
  {
    description: "client resolved command - fulfilled",
    input: {
      resolvedCommands: { 1: { type: "string", value: "to test you" } },
    },
    openAiResults: [`Finished\nAction: finish()`],
    snapshotPrompts: true,
    initialState: pendingClientCommandState,
  },
  {
    description: "nested calls",
    input: { request: "some request" },
    openAiResults: [
      `I need to get the current time in New York and create a calendar event 5 days from now
Action: time("America/New_York"); createCalendarEvent(relativeTime("5 days from now"), "Dinner with Wife")`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "request needs more context",
    input: { request: "some request" },
    openAiResults: [
      `I need to do something
Action: now(); editProse("convert to poem"); now()`,
    ],
  },
  {
    description: "request needs more context - still missing",
    input: { requestContext: {} },
    openAiResults: [],
    initialState: pendingRequestContextState,
  },
  {
    description: "request needs more context - wrong type",
    input: { requestContext: { text: { type: "number", value: 123 } } },
    openAiResults: [],
    snapshotError: true,
    initialState: pendingRequestContextState,
  },
  {
    description: "request needs more context - fulfilled",
    input: { requestContext: { text: { type: "string", value: `some text` } } },
    openAiResults: [
      `the result of editProse()`,
      `I am finished\nAction: finish()`,
    ],
    snapshotPrompts: true,
    initialState: pendingRequestContextState,
  },
  {
    description: "fulfilled but max loops",
    input: { requestContext: { text: { type: "string", value: `some text` } } },
    openAiResults: [`the result of editProse()`],
    snapshotError: true,
    initialState: {
      ...pendingRequestContextState,
      modelCallCount: MAX_MODEL_CALLS,
    },
  },
  {
    description: "wrong arg type",
    input: { request: "some request" },
    openAiResults: [
      `I need to do something
Action: now(); math(123)`,
    ],
    snapshotError: true,
  },
  {
    description: "wrong arg count",
    input: { request: "some request" },
    openAiResults: [
      `I need to do something
Action: now(); math()`,
    ],
    snapshotError: true,
  },

  // model uses wrong arg types
  // model uses wrong arg count
  // TODO: test arg parsers (natural language)
] as {
  description: string;
  openAiResults?: string[];
  input: Input;
  initialState?: NonNullable<Session["assist001State"]>;
  snapshotPrompts?: true;
  snapshotError?: true;
}[]) {
  Deno.test(test.description, async (t) => {
    let n = 0;
    let session: Session = {
      ...fixtures.session,
      assist001State: test.initialState,
    };
    let prompts: string[] = [];

    const openAiClient = {
      createCompletion(opts: { prompt: [string] }) {
        prompts.push(opts.prompt[0]);
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
          session: session,
          setUpdatedSession: (s) => {
            session = s;
          },
          signal: null as any,
          whisperEndpoint: null as any,
        },
        {
          model: "assist-001",
          commands: fixtures.commandSet,
        },
        test.input
      );

      await assertSnapshot(t, {
        output,
        state: session?.assist001State,
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
    call: parseFunctionCall(`test(a(), b(123, c()))`),
    resolvedCommands: {},
  },
  {
    description: "example A step 2",
    commandId: "0",
    call: parseFunctionCall(`test(a(), b(123, c()))`),
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
    call: parseFunctionCall(`test(a(), b(123, c()))`),
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
    call: parseFunctionCall(`test(a(), b(123, c()))`),
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
