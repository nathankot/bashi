#!/usr/bin/env -S deno run --allow-run --allow-write --allow-read --allow-env --allow-net --check --watch=static/,routes/ dev.ts

import dev from "$fresh/dev.ts";
import updateExamples from "./dev/updateExampleRequests.ts";
import generateOpenAPISpec from "./dev/generateOpenAPISpec.ts";

const srv = dev(import.meta.url, "./main.ts");
// update the prompt examples file:
const e = updateExamples("./static/assist_examples.jsonl");
const s = generateOpenAPISpec();

await Promise.all([srv, e, s]);
