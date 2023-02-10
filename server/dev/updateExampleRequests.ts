import * as t from "io-ts";

import defaultPolicy from "@lib/faultHandling.ts";
import { ModelDeps, run, models } from "@lib/models.ts";
import { log } from "@lib/log.ts";
import { openai, whisperEndpoint, googleSearch } from "@lib/clients.ts";

import * as fixtures from "@lib/fixtures.ts";

export const Example = t.intersection([
  t.type({
    updated: t.string,
    dev: t.any,
    result: models["assist-001"].Output.props.result,
    prompt: t.string,
  }),
  t.partial({
    resolvedCommands: models["assist-001"].Input.props.resolvedCommands,
  }),
]);

export type Example = t.TypeOf<typeof Example>;

const INPUTS: {
  variant?: string;
  prompt: string;
  resolvedCommands?: NonNullable<
    t.TypeOf<typeof models["assist-001"]["Input"]>["resolvedCommands"]
  >;
}[] = [
  { prompt: "hello" },
  { prompt: "What is pi squared?" },
  { prompt: "What is the time in New York?" },
  { prompt: "Say you are my best friend in Japanese." },
  { prompt: "Write you are my best friend in Japanese." },
  { prompt: "Who is george lucas the director?" },
  { prompt: "Who is george lucas?" },
  { prompt: "What is the capital of California?" },
  { prompt: "Who is Fred Rickerson? (not a real person)" },
  {
    prompt:
      "Translate what rooms do you have available to French, Spanish and Japanese",
  },
  {
    prompt:
      "whats the time in new york? and make a calendar event for dinner with wife 5 days from now",
  },
  { prompt: "how do you say behind the Comichi building in Japanese?" },
  { prompt: "what does the mode parameter do in the javascript fetch api?" },
  {
    prompt:
      "write an example http POST request in the browser using Javscript using the fetch api",
  },
  {
    prompt: "help me fix spelling and grammar mistakes",
    resolvedCommands: {
      getInput: {
        type: "string",
        value: `stp by step, heart to hard, left right left. is we all fall down..`,
      },
    },
  },
  {
    prompt: "edit this function in go lang in order to make it compile",
    resolvedCommands: {
      getInput: {
        type: "string",
        value: `
  function doSomething() int {
    return "55"
  }
  `,
      },
    },
  },
  {
    prompt: "make a calendar event for next tuesday noon, lunch with Bill",
  },
  {
    prompt:
      "there is a function in javascript I don't understand, can help me summarize it?",
    resolvedCommands: {
      getInput: {
        type: "string",
        value: `function something(num) {
  if (num < 0) return -1;
  else if (num == 0) return 1;
  else {
      return (num * something(num - 1));
  }
}`,
      },
    },
  },
  {
    prompt: "generate code in swift to create a new reminder on iOS",
  },
  //   {
  //     prompt:
  //       "given this list of verbs can you help me add additional verbs that mean the same thing?",
  //     resolvedCommands: {
  //       getInput: {
  //         type: "string",
  //         value: `
  //     "edit",
  //     "change",
  //     "alter",
  //     "fix",
  //     "move",
  //     "align",
  //     "reword",
  //     "re-word",
  //     "editor",
  //     "improve",
  //     "check",
  //     "revise",
  //     "modify",
  //     "adapt",
  //     "rewrite",
  //     "re-write",
  // `,
  //       },
  //     },
  //   },
  {
    prompt: "help me write a commit message please",
  },

  // TODO: something like 'highlight the selected string', will it be able to differentiate from
  // having the request string be in the request?
];

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
        throw new Error(`could not decode: ${JSON.stringify(v)}`);
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
    googleSearch,
    openai,
    whisperEndpoint,
    signal: abortController.signal,
    setUpdatedSession: () => {},
  };

  const newExamples: Example[] = [];
  let hasChanges = false;

  for (const input of INPUTS) {
    const promptWithVariant =
      input.prompt + (input.variant == null ? "" : " - " + input.variant);
    const existing = existingExamples[promptWithVariant];
    if (existing != null) {
      newExamples.push(existing);
      continue;
    }
    log(
      "info",
      `found new example, running model with prompt: ${promptWithVariant}`
    );
    try {
      let resolvedCommands: t.TypeOf<
        typeof models["assist-001"]["Input"]
      >["resolvedCommands"] = {};

      let output: t.TypeOf<typeof models["assist-001"]["Output"]> | null = null;
      modelLoop: while (true) {
        output = await run(modelDeps, "assist-001", {
          request: input.prompt,
          resolvedCommands,
        });
        if (!("result" in output)) {
          throw new Error(`unexpected output: ${JSON.stringify(output)}`);
        }
        const result = output.result;
        if (result.type === "pending_commands") {
          let hasResolution = false;
          for (const pending of result.pendingCommands) {
            const fixtureResolution = (input.resolvedCommands ?? {})[
              pending.name
            ];
            if (fixtureResolution == null) {
              continue;
            }
            resolvedCommands[pending.id] = fixtureResolution;
            hasResolution = true;
          }
          if (hasResolution) {
            continue modelLoop;
          }
        }
        break;
      }

      log("info", `got result for: ${promptWithVariant}`);
      hasChanges = true;
      newExamples.push({
        updated: new Date().toISOString(),
        prompt: promptWithVariant,
        dev: (output as any).dev,
        result: output.result,
        resolvedCommands: input.resolvedCommands ?? {},
      });
    } catch (e) {
      log("error", "model run failed with error, ignoring result");
      log("error", e);
    }
  }

  if (hasChanges) {
    Deno.writeTextFileSync(
      examplesFile,
      newExamples.map((e) => JSON.stringify(e)).join("\n")
    );
  }
}
