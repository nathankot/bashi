import { noop } from "cockatiel";

import { assertSnapshot } from "std/testing/snapshot.ts";
import * as fixtures from "@lib/fixtures.ts";

import { Input, run } from "./assist001.ts";

for (const test of [
  {
    description: "blah",
    input: { request: "some request" },
    openAiResults: [
      `I need to do something
Action: now(); ask("what do you want?")`,
    ],
  },

  // request that needs more context
  // resolving additional context
  // resuming a request with resolved commands
  // resuming a request without resolving missing commands
  // resuming a request but there were no resolved commands
  // multiple return values resolved from delimited actions
  // model returns an empty result
  // finish() sink
  // test arg parsers (natural language)
  // max loop count
  // TODO: assert session afterwards
] satisfies {
  description: string;
  openAiResults?: string[];
  input: Input;
}[]) {
  Deno.test(test.description, async (t) => {
    let n = 0;
    let session = fixtures.session;
    const openAiClient = {
      createCompletion() {
        const text = test.openAiResults[n];
        if (text == null) {
          throw new Error(`openai mock on index ${n} not available`);
        }
        n++;
        return { data: { choices: [{ text }] } };
      },
    };

    const output = await run(
      {
        faultHandlingPolicy: noop,
        log: () => {},
        now: () => fixtures.now,
        openai: openAiClient as any,
        session: fixtures.session,
        setUpdatedSession: (s) => {
          session = s;
        },
        signal: null as any,
        whisperEndpoint: null as any,
      },
      {
        model: "assist-001",
        commands: {},
      },
      test.input
    );

    await assertSnapshot(t, {
      output,
      state: session?.assist001State,
      n,
    });
  });
}
