import { assertSnapshot } from "std/testing/snapshot.ts";
import { stub } from "std/testing/mock.ts";

import * as fixtures from "@lib/fixtures.ts";
import * as clients from "@lib/clients.ts";
import { handler } from "./[modelName].ts";

const nowFixture = new Date(1671439270000);

for (const test of [
  {
    description: "success",
    model: "assist-davinci-003",
    request: `{ "request": "whats the time in new york?" }`,
    session: fixtures.session,
    openAiFn: async () =>
      ({
        data: {
          choices: [
            {
              text: `
fact("mock response")
   unknownCall(123)
unparseable(
time("America/New_York")
email("not enough args")
email("blah@blah.com", "some subject", "some body")
say()
reminder("in 5 days", "some reminder name")`,
            },
          ],
        },
      } as any),
  },
  {
    description: "openai errors",
    model: "assist-davinci-003",
    request: `{ "request": "whats the time in new york?" }`,
    session: fixtures.session,
    openAiFn: async () => {
      throw new Error("mock error");
    },
  },
  {
    description: "noop model works",
    model: "noop",
    request: `{}`,
    session: fixtures.session,
    openAiFn: null,
  },
  // too many tokens
  // rate limited (or maybe handled by middleware?)
]) {
  Deno.test(
    `POST /api/session/requests/${test.model}: ` + test.description,
    async (t) => {
      const openAiStub =
        test.openAiFn == null
          ? null
          : stub(clients.openai, "createCompletion", test.openAiFn);

      try {
        const enc = new TextEncoder();
        const req = new Request(
          `http://localhost/api/session/requests/${test.model}`,
          {
            method: "POST",
            body: enc.encode(test.request),
          }
        );
        req.headers.set("Content-Type", "application/json");
        const response = await handler.POST!(req, {
          ...fixtures.handlerCtx,
          params: {
            modelName: test.model,
          },
          state: {
            now: () => nowFixture,
            clients,
            session: test.session,
            log: () => {},
          },
        });
        const responseJson = await response.json();
        await assertSnapshot(t, responseJson);
      } finally {
        if (openAiStub != null) {
          openAiStub.restore();
        }
      }
    }
  );
}
