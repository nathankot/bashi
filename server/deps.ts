// This file is used to load a subset of dependencies via `deno cache` as a early layer in the Dockerfile.
//
// ONLY PRODUCTION DEPS should be included here.

import "$fresh/plugins/twind.ts";
import "$fresh/server.ts";
import "@preact/signals";
import "@preact/signals-core";
import "fp-ts";
import "https://deno.land/x/dotenv/load.ts";
import "io-ts";
import "io-ts-types";
import "mathjs";
import "openai";
import "preact";
import "preact/hooks";
import "redis";
import "cockatiel";
import "chrono";
import "std/log/mod.ts";
import "twind";
import "typescript-parsec";

// @deno-types="https://esm.sh/@ygoe/msgpack@1.0.3/msgpack.d.ts"
export { default as msgpack } from "https://esm.sh/@ygoe/msgpack@1.0.3/msgpack.js";
