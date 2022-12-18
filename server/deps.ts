// This file is used to load a subset of dependencies via `deno cache` as a early layer in the Dockerfile.

import "openai";
import "twind";
import "preact";
import "preact/hooks";
import "@preact/signals";
import "@preact/signals-core";
import "https://deno.land/x/dotenv/load.ts";
import "io-ts";
import "io-ts-types";
import "fp-ts";
import "redis";
import "mathjs";
import "typescript-parsec";
import "$fresh/server.ts";
import "$fresh/plugins/twind.ts";

// @deno-types="https://esm.sh/@ygoe/msgpack@1.0.3/msgpack.d.ts"
export { default as msgpack } from "https://esm.sh/@ygoe/msgpack@1.0.3/msgpack.js";
