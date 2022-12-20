/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";
import { setup as setupLogger, log } from "@lib/log.ts";

import { retryPolicy, circuitBreakerPolicy } from "@lib/faultHandling.ts";

await setupLogger();

retryPolicy.onRetry((v) => {
  log("debug", "fault handling - retry");
});

circuitBreakerPolicy.onBreak((v) => {
  log("debug", "fault handling - circuit breaker");
});

await start(manifest, {
  port: 8080,
  plugins: [twindPlugin(twindConfig)],
});
