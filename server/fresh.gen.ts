// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/api/request.ts";
import * as $1 from "./routes/api/transcribe.ts";
import * as $2 from "./routes/index.tsx";
import * as $$0 from "./islands/AudioPrompt.tsx";
import * as $$1 from "./islands/TextPrompt.tsx";

const manifest = {
  routes: {
    "./routes/api/request.ts": $0,
    "./routes/api/transcribe.ts": $1,
    "./routes/index.tsx": $2,
  },
  islands: {
    "./islands/AudioPrompt.tsx": $$0,
    "./islands/TextPrompt.tsx": $$1,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
