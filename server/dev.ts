#!/usr/bin/env -S deno run --check -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import updateExamples from "./dev/update_example_requests.ts";
import generateSwaggerSpec from "./dev/generate_swagger_spec.ts";

const srv = dev(import.meta.url, "./main.ts");
// update the prompt examples file:
const e = updateExamples("./static/assist_examples.jsonl");
const s = generateSwaggerSpec();

await Promise.all([srv, e, s]);
