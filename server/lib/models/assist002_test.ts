import { noop } from "cockatiel";
import { ChatCompletionRequestMessage } from "openai";

import { fail } from "std/testing/asserts.ts";
import { assertSnapshot } from "std/testing/snapshot.ts";
import * as fixtures from "@lib/fixtures.ts";
import { Session } from "@lib/session.ts";

import { MAX_MODEL_CALLS, Input, run, parseCompletion } from "./assist002.ts";

const pendingClientCommandState = () =>
  ({
    modelCallCount: 1,
    pending: [
      {
        action: 'createCalendarEvent("2022-01-01", "event name")',
        statements: [
          {
            type: "call",
            name: "createCalendarEvent",
            args: [
              { type: "string", value: "2022-01-01" },
              { type: "string", value: "event name" },
            ],
          },
        ],
        result: undefined,
      },
    ],
    request: "some request",
    resolvedActions: [
      {
        action: "now()",
        statements: [{ type: "call", args: [], name: "now" }],
        result: "2022-12-19T08:41:10.000Z",
      },
    ],
    resolvedCommands: [
      {
        args: [],
        id: "0.0",
        name: "now",
        returnValue: { type: "string", value: "2022-12-19T08:41:10.000Z" },
        type: "executed",
      },
    ],
    memory: { variables: {}, topLevelResults: [] },
  } satisfies Session["assist002State"]);

const pendingInputState = () =>
  ({
    modelCallCount: 1,
    pending: [
      {
        action: "some response",
        isRespond: true,
        statements: [
          {
            type: "call",
            args: [{ type: "string", value: "some response" }],
            name: "respond",
          },
        ],
        result: undefined,
      },
    ],
    request: "some request",
    resolvedActions: [
      {
        action: "someCommand()",
        result: `"blah"`,
        statements: [
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
        id: "0.0",
        name: "someCommand",
        returnValue: { type: "string", value: "blah" },
      },
    ],
    memory: { variables: {}, topLevelResults: [] },
  } satisfies Session["assist002State"]);

for (const test of [
  {
    description: "all commands resolved on the server",
    openAiResults: [
      `Run { now() }
       Run { math("pi^2 + 123") }`,
      `Your request has been fulfilled.`,
    ],
    snapshotPrompts: true,
  },
  {
    description:
      "all commands resolved on the server - empty response tries again",
    openAiResults: [`Run { math("pi^2 + 123") }`, ``, `Finish`],
    snapshotPrompts: true,
  },
  {
    description: "multiple actions in a single completion",
    openAiResults: [
      `Run { now() }\n run { math("pi^2 + 123") }\nRun { now() }`,
      `Your request has been fulfilled.`,
    ],
  },
  {
    description: "multiple functions in a single run block",
    openAiResults: [
      `Run { now(); now(); math('2^2')\n\nnow() }`,
      `Your request has been fulfilled.`,
    ],
  },
  {
    description: "non-action lines at the end of a completion",
    openAiResults: [
      `Run { now() }\n run { math("pi^2 + 123") }\n\nthisline is not prefixed with action, what will be the behavior?`,
      `Your request has been fulfilled.`,
    ],
  },
  {
    description: "command overloads work",
    openAiResults: [
      `Run {  123 + 1; }\nRun { "string" + "concat";}`,
      `I have finished`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "infix + operand support",
    openAiResults: [
      `Run { respond("infix " + (currentTimeForTimezone("America/New_York") + " hello")) }`,
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs with lots of newlines",
    openAiResults: [
      `Run { \ncreateCalendarEvent(parseRelativeTime("5 days from now"), "Dinner with wife"); }
Run { \nrespond("The time in New York is " + currentTimeForTimezone("America/New_York") + " and I have created a calendar event for dinner with your wife 5 days from now."); }`,
    ],
  },
  {
    description: "supports model outputs with top level infix call",
    openAiResults: [
      "Run { currentTimeForTimezone(`America/${`New_York`}`);  }\nRun { createCalendarEvent(parseRelativeTime(`in ${5} days`), 'Dinner with Wife');}",
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs using template strings",
    openAiResults: [
      `Run { now() + ' ' + currentTimeForTimezone('America/New_York'); }
Run {  createCalendarEvent(parseRelativeTime('in 5 days'), 'Dinner with Wife'); }`,
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs with top level expression",
    openAiResults: [
      `Run { "some string"; }
Run { 123 }`,
      `I have finished`,
    ],
  },
  {
    description: "supports assignment",
    openAiResults: [
      `Run { a = 123; }
Run { b = 111; }
Run { a + b; }`,
      `I have finished`,
    ],
  },
  {
    description: "malformed command should fail rather than return as string",
    snapshotError: true,
    openAiResults: [
      'Run { \n  let nextTuesday = new Date();\n  nextTuesday.setDate(nextTuesday.getDate() + (2 + 7 - nextTuesday.getDay()) % 7);\n  nextTuesday.setHours(12, 0, 0, 0);\n  createCalendarEvent(nextTuesday.toISOString(), "Lunch with Bill");\n}\nI have created a calendar event for next Tuesday at noon for lunch with Bill.',
    ],
  },
  {
    description: "malformed command should fail rather than return as string 2",
    snapshotError: true,
    openAiResults: ["Run{!#notanactual.block}"],
  },
  {
    description: "server commands with identical inputs re-use results",
    input: { resolvedCommands: [] },
    openAiResults: [
      `Run { now();  }
Run { respond("not reused because client command") }`,
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
          returnValue: { type: "string", value: "0000-00-00T00:00:00Z" },
        },
        {
          type: "executed",
          args: [
            { type: "string", value: "not reused because client command" },
          ],
          id: "someid",
          name: "respond",
          returnValue: { type: "string", value: "this should not be reused" },
        },
      ],
    },
  },
  {
    description: "completion with a complex code sample",
    openAiResults: [
      `The \`mode\` parameter in the JavaScript Fetch API is used to specify the mode of the request. The mode determines how the request will be made and whether it will be restricted by CORS (Cross-Origin Resource Sharing) policy.

The available modes are:

- "cors": This is the default mode. It allows the request to be made across domains, subject to CORS policy restrictions.
- "no-cors": This mode allows the request to be made, but it does not allow access to the response data. This mode is useful for making requests to third-party APIs that do not support CORS.
- "same-origin": This mode restricts the request to the same origin as the page making the request. This mode is useful for making requests to the same domain as the page, and it is not subject to CORS policy restrictions.
- "navigate": This mode is used to navigate to a new page. It is only used by the \`window.fetch()\` method.

Here's an example of how to use the \`mode\` parameter in a fetch request:

\`\`\`
fetch('https://example.com/data.json', {
  mode: 'cors'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\``,
    ],
  },
  {
    description: "calendar event creation in a single completion",
    openAiResults: [
      `Run { var nextTuesday = "2022-12-27T12:00:00Z"; }
Run { createCalendarEvent(nextTuesday, "Lunch with Bill"); } \n
I have used the \`parseRelativeTime\` function to get the ISO8601 datetime for next Tuesday at 12:00pm in the user's timezone, and then used the \`createCalendarEvent\` function to create a calendar event with the given name.
`,
    ],
  },
  {
    description: "multiple assignment in one completion",
    openAiResults: [
      `Run { a = "What rooms do you have available?" }
Run { b = translate(a, "French") }
Run { c = translate(a, "Spanish") }
Run { d = translate(a, "Japanese") }
This string response line is ignored`,
      `french translation`,
      `spanish translation`,
      `japanese translation`,
      `The available rooms in French are "\${b}", in Spanish are "\${c}", and in Japanese are "\${d}".`,
    ],
  },
  {
    description: "client resolved command",
    openAiResults: [`Run { respond("what do you want?") }`],
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
      resolvedCommands: {
        "1.0": {
          type: "boolean",
          value: true,
        },
      },
    },
    openAiResults: [],
    snapshotError: true,
    initialState: pendingClientCommandState(),
  },
  {
    description: "client resolved command - fulfilled",
    input: {
      resolvedCommands: { "1.0": { type: "void" } },
    },
    openAiResults: [`I have finished`],
    snapshotPrompts: true,
    initialState: pendingClientCommandState(),
  },
  {
    description: "nested calls",
    openAiResults: [
      `Run { createCalendarEvent(parseRelativeTime("5 days from now"), "Dinner with Wife") }`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "request needs more context",
    openAiResults: [
      `Run { editText(respond("please provide the text"), "convert to poem") }`,
    ],
  },
  {
    description: "awaiting response - still missing",
    input: { resolvedCommands: [] },
    openAiResults: [],
    initialState: pendingInputState(),
  },
  {
    description: "awaiting response - fulfilled",
    input: {
      resolvedCommands: {
        "1.0": {
          type: "string",
          value: "some user response",
        },
      },
    },
    openAiResults: [`I have finished`],
    snapshotPrompts: true,
    initialState: pendingInputState(),
  },
  {
    description: "max model calls",
    input: {
      resolvedCommands: {
        "1.0": {
          type: "string",
          value: `some date`,
        },
      },
    },
    openAiResults: [`should not reach this`],
    snapshotError: true,
    initialState: {
      ...pendingInputState(),
      pending: [
        {
          action: "blah",
          statements: [{ type: "call", name: "now", args: [] }],
        },
      ],
      modelCallCount: MAX_MODEL_CALLS,
    },
  },
  {
    description: "wrong arg type",
    openAiResults: [`Run { now(); math(true) }`],
    snapshotError: true,
  },
  {
    description: "wrong arg count",
    openAiResults: [`Run { now(); math() }`],
    snapshotError: true,
  },
  {
    description: "long results are truncated and stored in variables",
    openAiResults: [
      `Run { longVar = "${new Array(500).fill("word").join(" ")}" }`,
      `Run { longVar; }`,
      `I have finished`,
    ],
    snapshotPrompts: true,
  },
  {
    description:
      "the 'result' var name is magic and refers to the previous result if not already assigned",
    openAiResults: [
      `Run { "hello result"; }`,
      `Run { result; }`,
      `Run { var a = "b" }`,
      `Run { rEsUlt; }`, // any case
      `Run { var result = "new result"; }`, // override
      `Run { "this should not show up twice"; }`,
      `Run { result; }`, // should be the variable
      `Run { "this should show up"; }`,
      `Run { reSult; }`, // should be the result
      "I have finished: ${result}",
    ],
  },
  {
    description: "string to number and vice versa implicit conversion",
    openAiResults: [
      `Run { math(123123) }`,
      `Run { commandWithNumberArg("123123.00") }`,
      `I have finished`,
    ],
  },

  // Error handling
  {
    description: "recoverable error - function does not exist",
    openAiResults: [
      `Run { doesnotexist(123, true) }`,
      `Run { now() }`,
      `Complete`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "recoverable error - bad argument count, type",
    openAiResults: [
      `Run { translate() }
Run { translate('', '') }`, // second action gets ignored
      `Run { now() }`,
      `Run { translate(true, 123) }`,
      `Complete`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "recoverable error - nested errors get bubbled up",
    openAiResults: [
      `Run { editText(translate(math(true), 'blah'), 'blah') }`,
      `Run { editText(translate(unknownCommand(true), 'blah'), 'blah') }`,
      `Run { now() }`,
      `Complete`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "recoverable error - action block syntax error",
    openAiResults: [
      `Run { not a valid run block }`,
      `Run { ;;; }\nblahblah`,
      `Run { now() }\nRun { error.on.second.line }`,
      `\n\n\nRun { properties.doNotExist }`,
      `Run { methods.doNotExist() }`,
      `Complete`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "recoverable error - no overload found",
    openAiResults: [`Run { true + 123 }`, `Complete`],
    snapshotPrompts: true,
  },
  {
    description: "recoverable error - error on the last statement",
    openAiResults: [
      `Run { now(); now(); doesnotexist(123, true) }`,
      `Complete`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "recoverable error - client command results in error",
    openAiResults: ["Complete"],
    snapshotPrompts: true,
    input: {
      resolvedCommands: {
        "0.0": {
          type: "error",
          message: "a mock error",
        },
      },
    },
    initialState: {
      modelCallCount: 1,
      pending: [
        {
          action: "mockCommand()",
          statements: [
            {
              type: "call",
              name: "mockCommand",
              args: [],
            },
          ],
          result: undefined,
        },
      ],
      request: "some request",
      resolvedActions: [],
      resolvedCommands: [],
      memory: { variables: {}, topLevelResults: [] },
    },
  },
  {
    description: "error - client command sends back wrong return type",
    openAiResults: ["Complete"],
    snapshotError: true, // This should throw because it is not recoverable
    input: {
      resolvedCommands: {
        "0.0": { type: "void" },
      },
    },
    initialState: {
      modelCallCount: 1,
      pending: [
        {
          action: "mockCommand()",
          statements: [
            {
              type: "call",
              name: "mockCommand",
              args: [],
            },
          ],
          result: undefined,
        },
      ],
      request: "some request",
      resolvedActions: [],
      resolvedCommands: [],
      memory: { variables: {}, topLevelResults: [] },
    },
  },
] as {
  description: string;
  openAiResults?: string[];
  only?: boolean;
  input?: Input;
  initialState?: NonNullable<Session["assist002State"]>;
  snapshotPrompts?: true;
  snapshotError?: true;
}[]) {
  Deno.test(test.description, { only: test.only ?? false }, async (t) => {
    let n = 0;
    let session: Session = {
      ...fixtures.session,
      assist002State: test.initialState,
    };
    let prompts: ChatCompletionRequestMessage[] = [];

    const openAiClient = {
      createChatCompletion(opts: { messages: ChatCompletionRequestMessage[] }) {
        prompts = [...opts.messages.slice(2)];
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

    let didError = false;
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
            mockCommand: {
              args: [],
              description: "a mock client command",
              returnType: "string",
            },
          },
        },
        test.input ?? { request: "some request" }
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
      didError = true;
      if (test.snapshotError !== true) {
        throw e;
      }

      await assertSnapshot(t, e.message);
    }

    if (test.snapshotError === true && !didError) {
      fail("expected an error to be thrown");
    }
  });
}

Deno.test("complex parseCompletion", async (t) => {
  await assertSnapshot(
    t,
    parseCompletion(
      `\nRUN { a(b()) }
RUN{ d(\n123\n) }

RUN{ c() }
RuN {
  c(
    "RUN { a() }"
  )
}

run { a = 123 }
run {
  a = 123
}
hello 123
test test 1111 RUN { c() }

    RUN { f() }

hello interpolate \${a} \`escaped backquotes\` \\\`, test test {not interpolated} $`
    )
  );
});
