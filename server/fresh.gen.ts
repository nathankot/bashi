// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/_500.tsx";
import * as $1 from "./routes/api/_middleware.ts";
import * as $2 from "./routes/api/session/_middleware.ts";
import * as $3 from "./routes/api/session/requests/[modelName].ts";
import * as $4 from "./routes/api/session/requests/[modelName]_test.ts";
import * as $5 from "./routes/api/sessions.ts";
import * as $6 from "./routes/index.tsx";
import * as $$0 from "./islands/AudioPrompt.tsx";
import * as $$1 from "./islands/Examples.tsx";
import * as $$2 from "./islands/PromptDev.tsx";
import * as $$3 from "./islands/TextPrompt.tsx";

const manifest = {
  routes: {
    "./routes/_500.tsx": $0,
    "./routes/api/_middleware.ts": $1,
    "./routes/api/session/_middleware.ts": $2,
    "./routes/api/session/requests/[modelName].ts": $3,
    "./routes/api/session/requests/[modelName]_test.ts": $4,
    "./routes/api/sessions.ts": $5,
    "./routes/index.tsx": $6,
  },
  islands: {
    "./islands/AudioPrompt.tsx": $$0,
    "./islands/Examples.tsx": $$1,
    "./islands/PromptDev.tsx": $$2,
    "./islands/TextPrompt.tsx": $$3,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
