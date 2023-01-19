import { noop } from "cockatiel";

import { assertSnapshot } from "std/testing/snapshot.ts";
import { stub } from "std/testing/mock.ts";
import * as fixtures from "@lib/fixtures.ts";
import * as clients from "@lib/clients.ts";

import { Input, run } from "./assist001.ts";

for (const test of [
  {
    description: "blah",
    input: { request: "some request" },
    openAiResults: [
      `I need to do something
Action: currentTime()`,
    ],
  },
] satisfies {
  description: string;
  input: Input;
  openAiResults?: string[];
}[]) {
  Deno.test(test.description, async (t) => {
    let n = 0;
    const openAiStub =
      test.openAiResults == null
        ? null
        : stub(clients.openai, "createCompletion", async () => {
            const text = test.openAiResults[n];
            if (text == null) {
              throw new Error(`openai mock on index ${n} not available`);
            }
            n++;
            return { data: { choices: [{ text }] } } as any;
          });

    if (openAiStub != null) {
      openAiStub.restore();
    }

    const output = await run(
      {
        faultHandlingPolicy: noop,
        log: () => {},
        now: () => fixtures.now,
        openai: clients.openai,
        session: fixtures.session,
        setUpdatedSession: () => {},
        signal: null as any,
        whisperEndpoint: clients.whisperEndpoint,
      },
      {
        model: "assist-001",
        commands: {},
      },
      test.input
    );

    await assertSnapshot(t, output);
  });
}
