import { assertSnapshot } from "std/testing/snapshot.ts";
import { stub } from "std/testing/mock.ts";

import * as fixtures from "@lib/fixtures.ts";
import * as clients from "@lib/clients.ts";
import { handler } from "./requests.ts";

const nowFixture = new Date();

for (const test of [
  {
    description: "success",
    request: `{ "model": "assist-davinci-003", "request": "a mock request" }`,
    session: fixtures.session,
    openAiFn: async () =>
      ({
        data: {
          choices: [
            {
              text: "fake response",
            },
          ],
        },
      } as any),
  },
  {
    description: "openai errors",
    request: `{ "model": "assist-davinci-003", "request": "a mock request" }`,
    session: fixtures.session,
    openAiFn: async () => {
      throw new Error("mock error");
    },
  },
  // too many tokens
  // rate limited (or maybe handled by middleware?)
]) {
  Deno.test("POST /api/session/requests: " + test.description, async (t) => {
    const openAiStub = stub(clients.openai, "createCompletion", test.openAiFn);

    try {
      const enc = new TextEncoder();
      const req = new Request("http://localhost/", {
        method: "POST",
        body: enc.encode(test.request),
      });
      req.headers.set("Content-Type", "application/json");
      const response = await handler.POST!(req, {
        ...fixtures.handlerCtx,
        state: {
          now: nowFixture,
          clients,
          session: test.session,
        },
      });
      const responseJson = await response.json();
      await assertSnapshot(t, responseJson);
    } finally {
      openAiStub.restore();
    }
  });
}
