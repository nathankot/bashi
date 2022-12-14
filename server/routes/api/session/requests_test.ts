import { assertSnapshot } from "std/testing/snapshot.ts";
import { stub } from "std/testing/mock.ts";

import { handlerCtx, session } from "@/fixtures.ts";
import * as clients from "@/clients.ts";
import { handler } from "./requests.ts";

const nowFixture = new Date();

Deno.test("/requests - valid completion request", async (t) => {
  const openAiStub = stub(
    clients.openai,
    "createCompletion",
    async () =>
      ({
        data: {
          choices: [
            {
              text: "fake response",
            },
          ],
        },
      } as any)
  );
  try {
    const enc = new TextEncoder();
    const req = new Request("http://localhost/", {
      method: "POST",
      body: enc.encode(`{ "request": "a mock request" }`),
    });
    req.headers.set("Content-Type", "application/json");
    const response = await handler.POST!(req, {
      ...handlerCtx,
      state: {
        now: nowFixture,
        clients,
        session,
      },
    });
    const responseJson = await response.json();
    await assertSnapshot(t, responseJson);
  } finally {
    openAiStub.restore();
  }
});

// invalid session
// invalid request
// too many tokens
// rate limited
