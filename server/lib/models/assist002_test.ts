import { noop } from "cockatiel";
import { ChatCompletionRequestMessage } from "openai";

import { assertSnapshot } from "std/testing/snapshot.ts";
import * as fixtures from "@lib/fixtures.ts";
import { Session } from "@lib/session.ts";

import { MAX_MODEL_CALLS, Input, run, parseCompletion } from "./assist002.ts";

const pendingClientCommandState = () =>
  ({
    modelCallCount: 1,
    pending: [
      {
        action: 'now(); createCalendarEvent("2022-01-01", "event name")',
        expressions: [
          { type: "call", args: [], name: "now" },
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
    resolvedActions: [],
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

const pendingInputState = () =>
  ({
    modelCallCount: 1,
    pending: [
      {
        action: 'respond("some response")',
        expressions: [
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
      `Action { now(); math("pi^2 + 123") }`,
      `Your request has been fulfilled.`,
    ],
    snapshotPrompts: true,
  },
  {
    description:
      "all commands resolved on the server - empty response tries again",
    input: { request: "some request" },
    openAiResults: [`Action { now(); math("pi^2 + 123") }`, ``, `Finish`],
    snapshotPrompts: true,
  },
  {
    description: "multiple actions in a single completion",
    input: { request: "some request" },
    openAiResults: [
      `Action { now() }\n action { math("pi^2 + 123") }\nAction { now() }`,
      `Your request has been fulfilled.`,
    ],
  },
  {
    description: "non-action lines at the end of a completion",
    input: { request: "some request" },
    openAiResults: [
      `Action { now() }\n action { math("pi^2 + 123") }\n\nthisline is not prefixed with action, what will be the behavior?`,
      `Your request has been fulfilled.`,
    ],
  },
  {
    description: "command overloads work",
    input: { request: "some request" },
    openAiResults: [
      `Action { "string" + "concat"; 123 + 1; }`,
      `I have finished`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "infix + operand support",
    input: { request: "some request" },
    openAiResults: [
      `Action { respond("infix " + (currentTimeForTimezone("America/New_York") + " hello")) }`,
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs with lots of newlines",
    input: { request: "some request" },
    openAiResults: [
      `Action { \nrespond("The time in New York is " + currentTimeForTimezone("America/New_York") + " and I have created a calendar event for dinner with your wife 5 days from now.");\ncreateCalendarEvent(parseRelativeTime("5 days from now"), "Dinner with wife"); }`,
    ],
  },
  {
    description: "supports model outputs with top level infix call",
    input: { request: "some request" },
    openAiResults: [
      "Action { currentTimeForTimezone(`America/${`New_York`}`); createCalendarEvent(parseRelativeTime(`in ${5} days`), 'Dinner with Wife'); }",
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs using template strings",
    input: { request: "some request" },
    openAiResults: [
      `Action { now() + ' ' + currentTimeForTimezone('America/New_York'); createCalendarEvent(parseRelativeTime('in 5 days'), 'Dinner with Wife'); }`,
      `I have finished`,
    ],
  },
  {
    description: "supports model outputs with top level expression",
    input: { request: "some request" },
    openAiResults: [
      `Action { "some string"; 123; currentTimeForTimezone('Pacific/Auckland') }`,
      `I have finished`,
    ],
  },
  {
    description: "supports assignment",
    input: { request: "some request" },
    openAiResults: [`Action { a = 123; b = 111; a + b; }`, `I have finished`],
  },
  {
    description: "server commands with identical inputs re-use results",
    input: { resolvedCommands: [] },
    openAiResults: [
      `Action { now(); respond("not reused because client command") }`,
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
          name: "respond",
          returnValue: "this should not be reused",
        },
      ],
    },
  },
  {
    description: "completion with a complex code sample",
    input: { request: "some request" },
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
    input: { request: "some request" },
    openAiResults: [
      `Action { var nextTuesday = "2022-12-27T12:00:00Z"; }
Action { createCalendarEvent(nextTuesday, "Lunch with Bill"); } \n
I have used the \`parseRelativeTime\` function to get the ISO8601 datetime for next Tuesday at 12:00pm in the user's timezone, and then used the \`createCalendarEvent\` function to create a calendar event with the given name.
`,
    ],
  },
  {
    description: "multiple assignment in one completion",
    input: { request: "some request" },
    openAiResults: [
      `Action { a = "What rooms do you have available?" }
Action { b = translate(a, "French") }
Action { c = translate(a, "Spanish") }
Action { d = translate(a, "Japanese") }
The available rooms in French are "\${b}", in Spanish are "\${c}", and in Japanese are "\${d}".`,
      `french translation`,
      `spanish translation`,
      `japanese translation`,
    ],
  },
  {
    description: "client resolved command",
    input: { request: "some request" },
    openAiResults: [`Action { now(); respond("what do you want?") }`],
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
      resolvedCommands: { 1: { type: "void" } },
    },
    openAiResults: [`I have finished`],
    snapshotPrompts: true,
    initialState: pendingClientCommandState(),
  },
  {
    description: "nested calls",
    input: { request: "some request" },
    openAiResults: [
      `Action { currentTimeForTimezone("America/New_York"); createCalendarEvent(parseRelativeTime("5 days from now"), "Dinner with Wife") }`,
    ],
    snapshotPrompts: true,
  },
  {
    description: "request needs more context",
    input: { request: "some request" },
    openAiResults: [
      `Action { now(); editText(respond("please provide the text"), "convert to poem"); now() }`,
    ],
  },
  {
    description: "request needs more context - still missing",
    input: { resolvedCommands: [] },
    openAiResults: [],
    initialState: pendingInputState(),
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
    initialState: pendingInputState(),
  },
  {
    description: "request needs more context - fulfilled",
    input: {
      resolvedCommands: {
        "1.0.0": {
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
      ...pendingInputState(),
      modelCallCount: MAX_MODEL_CALLS,
    },
  },
  {
    description: "wrong arg type",
    input: { request: "some request" },
    openAiResults: [`Action { now(); math(true) }`],
    snapshotError: true,
  },
  {
    description: "wrong arg count",
    input: { request: "some request" },
    openAiResults: [`Action { now(); math() }`],
    snapshotError: true,
  },
  {
    description: "top level commands are resolved sequentially",
    input: { request: "some request" },
    openAiResults: [
      `Action { respond("how are you?"); currentTimeForTimezone("America/New_York") }`,
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
      pending: [
        {
          action:
            'respond("how are you?"); currentTimeForTimezone("America/New_York")',
          expressions: [
            {
              args: [{ type: "string", value: "how are you?" }],
              name: "respond",
              type: "call",
            },
            {
              args: [{ type: "string", value: "America/New_York" }],
              name: "currentTimeForTimezone",
              type: "call",
            },
          ],
          result: undefined,
        },
      ],
      request: "some request",
      resolvedActions: [],
      resolvedCommands: [],
    },
  },
  {
    description: "long results are truncated and stored in variables",
    input: { request: "some request" },
    openAiResults: [
      `Action { longVar = "${new Array(500)
        .fill("word")
        .join(" ")}"; longVar; }`,
      `I have finished`,
    ],
    snapshotPrompts: true,
  },
  {
    description:
      "the 'result' var name is magic and refers to the previous result if not already assigned",
    input: { request: "some request" },
    openAiResults: [
      `Action { "hello result"; }`,
      `Action { result; }`,
      `Action { var a = "b"; "should override result within same action"; result; }`, // assignment returns void which should be ignored
      `Action { rEsUlt; }`, // any case
      `Action { var result = "new result"; }`, // override
      `Action { "this should not show up twice"; }`,
      `Action { result; }`, // should be the variable
      `Action { "this should show up"; }`,
      `Action { reSult; }`, // should be the result
      "I have finished: ${result}",
    ],
  },
  {
    description: "string to number and vice versa implicit conversion",
    input: { request: "some request" },
    openAiResults: [
      `Action { math(123123) }`,
      `Action { commandWithNumberArg("123123.00") }`,
      `I have finished`,
    ],
  },
] as {
  description: string;
  openAiResults?: string[];
  only?: boolean;
  input: Input;
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

Deno.test("complex parseCompletion", async (t) => {
  await assertSnapshot(
    t,
    parseCompletion(
      `\nACTION { a(b()) }
ACTION{ d(\n123\n); g();}

ACTION{ c() }
ActiON {
  c(
    "ACTION { a() }"
  ); g(123)
}

action { a = 123; b = 111; a + b; }
action {
  a = 123
  b = 111
  a + b
}
hello 123
test test 1111 ACTION { c() }

    ACTION { f() }

hello interpolate \${a} \`escaped backquotes\` \\\`, test test {not interpolated} $`
    )
  );
});
