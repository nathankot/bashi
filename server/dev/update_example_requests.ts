import * as t from "io-ts";

import defaultPolicy from "@lib/faultHandling.ts";
import { ModelDeps, run } from "@lib/models.ts";
import { log } from "@lib/log.ts";
import { openai, whisperEndpoint } from "@lib/clients.ts";
import { FunctionCalls } from "@lib/function.ts";

import * as fixtures from "@lib/fixtures.ts";

const Example = t.type({
  updated: t.string,
  prompt: t.string,
  functionCalls: FunctionCalls,
  completion: t.string,
});

type Example = t.TypeOf<typeof Example>;

const EXAMPLES = `
hello
What is pi squared?
What is the time in New York?
Say you are my best friend in Japanese.
Write you are my best friend in Japanese.
Who is george lucas the director?
Who is george lucas?
What is the capital of California?
Who is Fred Rickerson? (not a real person)
Translate what rooms do you have available in French, Spanish and Japanese
whats the time in new york? and make a calendar event for dinner with wife 5 days from now
how do you say behind the Comichi building in Japanese?
what does the mode parameter do in the javascript fetch api?
write an example http POST request in the browser using Javscript using the fetch api
`
  .split("\n")
  .filter((l) => l.trim() !== "");

export default async function updateExamples(examplesFile: string) {
  log("info", `reading existing examples file: ${examplesFile}`);

  const bs = Deno.readFileSync(examplesFile);
  const existingText = new TextDecoder().decode(bs);
  const existingExamples = existingText
    .split("\n")
    .filter((t: string) => t.length > 0)
    .map((v: string): any => JSON.parse(v))
    .map((v: any): Example => {
      const decoded = Example.decode(v);
      if (!("right" in decoded)) {
        throw new Error(`could not decode: ${v}`);
      }
      return decoded.right;
    })
    .reduce(
      (a: Record<string, Example>, e: Example) => ({ ...a, [e.prompt]: e }),
      {}
    );

  const abortController = new AbortController();

  const modelDeps: ModelDeps = {
    log,
    faultHandlingPolicy: defaultPolicy,
    now: () => fixtures.now,
    session: fixtures.session,
    openai,
    whisperEndpoint,
    signal: abortController.signal,
  };

  const newExamples: Example[] = [];
  let hasChanges = false;

  for (const example of EXAMPLES) {
    const existing = existingExamples[example];
    if (existing != null) {
      newExamples.push(existing);
      continue;
    }
    log("info", `found new example, running model with prompt: ${example}`);
    const output = await run(modelDeps, "assist-000", {
      model: "assist-000",
      request: example,
    });
    log("info", `got result for: ${example}`);
    hasChanges = true;
    newExamples.push({
      updated: new Date().toISOString(),
      prompt: example,
      functionCalls: output.functionCalls,
      completion: output.functionCalls.map((c) => c.line).join("\n"),
    });
  }

  if (hasChanges) {
    Deno.writeTextFileSync(
      examplesFile,
      newExamples.map((e) => JSON.stringify(e)).join("\n")
    );
  }
}
