// Preload dependencies to reduce the amount of work docker needs to do.
// In addition, some dependencies are only referenced on the frontend
// code and is not able to be picked up via normal `deno cache` resolution.
import "$fresh/plugins/twind/main.ts";
import "$fresh/src/runtime/main.ts";
import "chrono";
import "cockatiel";
import "date-fns-tz";
import "fp-ts";
import "generic-pool";
import "gpt-3-encoder";
import "io-ts";
import "io-ts-types";
import "mathjs";
import "msgpack/msgpack.js";
import "openai";
import "openapi-types";
import "preact";
import "preact-render-to-string";
import "preact/compat";
import "preact/debug";
import "preact/hooks";
import "preact/hooks";
import "preact/jsx-runtime";
import "preact/jsx-runtime";
import "redis";
import "twind";
import "twind/sheets";
import "typescript-parsec";
import "xhr-polyfill";
