import { assertSnapshot } from "std/testing/snapshot.ts";
import { stub } from "std/testing/mock.ts";

import { Session } from "@lib/session.ts";
import * as fixtures from "@lib/fixtures.ts";
import * as clients from "@lib/clients.ts";
import { handler } from "./[modelName].ts";

const nowFixture = fixtures.now;

for (const test of [
  {
    description: "success",
    model: "assist-001",
    request: `{ "request": "whats the time in new york? email translate" }`,
    session: {
      ...fixtures.session,
      configuration: {
        ...fixtures.session.configuration,
      },
    } as Session,
    openAiFn: async () =>
      ({
        data: {
          choices: [
            {
              text: `Thought run some actions
Action: sendResponse("mock response")`,
            },
          ],
        },
      } as any),
  },
  {
    description: "openai errors",
    model: "assist-001",
    request: `{ "request": "whats the time in new york?" }`,
    session: fixtures.session,
    openAiFn: async () => {
      throw new Error("mock error");
    },
  },
  {
    description: "empty request",
    model: "assist-001",
    request: `{ "request": "" }`,
    session: fixtures.session,
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
