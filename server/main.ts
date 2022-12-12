/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "https://deno.land/x/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

const requiredEnvvars = [
  "OPENAI_KEY",
  "REDIS_URL",
  "WHISPER_TRANSCRIBE_ENDPOINT",
];

for (const envvar of requiredEnvvars) {
  if (Deno.env.get(envvar) == null) {
    throw new Error(`${envvar} must be set`);
  }
}

await start(manifest, {
  port: 8080,
  plugins: [twindPlugin(twindConfig)],
});
