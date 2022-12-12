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
import "$fresh/server.ts";
import "$fresh/plugins/twind.ts";
import "msgpack";
