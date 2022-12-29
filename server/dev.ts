#!/usr/bin/env -S deno run --check -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import updateExamples from "./dev/updateExampleRequests.ts";
import generateSwaggerSpec from "./dev/generateSwaggerSpec.ts";

const srv = dev(import.meta.url, "./main.ts");
// update the prompt examples file:
const e = updateExamples("./static/assist_examples.jsonl");
const s = generateSwaggerSpec();

await Promise.all([srv, e, s]);
