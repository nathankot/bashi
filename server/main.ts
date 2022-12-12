/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { signal } from "$std/signal/mod.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

// Load clients
import { gracefulStop, setup } from "@/clients.ts";
await setup();

const abortController = new AbortController();

start(manifest, {
  port: 8080,
  plugins: [twindPlugin(twindConfig)],
  signal: abortController.signal,
});

const sig = signal("SIGTERM", "SIGINT");
for await (const _ of sig) {
  console.log("SIGINT or SIGTERM received");
  abortController.abort("closing");
  await gracefulStop();
  Deno.exit(0);
}
