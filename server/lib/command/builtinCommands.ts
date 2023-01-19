import * as mathjs from "mathjs";
import { parseDate } from "chrono";

import { PROGRAMMING_LANGUAGES } from "@lib/constants.ts";
import { BuiltinCommandDefinition } from "./types.ts";
import { HTTPError } from "@lib/errors.ts";
import { run } from "@lib/models.ts";

const time: BuiltinCommandDefinition<["string"]> = {
  description: `check the time for the given timezone`,
  args: [{ name: "tz database timezone name", type: "string" }],
  triggerTokens: ["time", "hour", "clock"],
  run: async ({ log, session, now }, reqCtx, [timeZone]) => {
    return {
      type: "string",
      value: now().toLocaleString(session.configuration.locale, {
        timeZone: timeZone.value.replaceAll(" ", "_"),
      }),
    };
  },
};

const math: BuiltinCommandDefinition<["string"]> = {
  description: `compute a math formula`,
  args: [{ name: "a mathjs expression ", type: "string" }],
  run: async ({ log, session }, reqCtx, [expr]) => {
    try {
      const result = mathjs.evaluate(expr.value);
      return { type: "string", value: `${result satisfies string}` };
    } catch (e) {
      log("info", "failed to parse math: " + expr.value);
      throw new HTTPError(e, 500);
    }
  },
};

const translate: BuiltinCommandDefinition<["string", "string"]> = {
  description: `translate something into a target language`,
  args: [
    { name: "full name of the target language", type: "string" },
    { name: "string to translate", type: "string" },
  ],
  run: async (modelDeps, reqCtx, [targetLanguage, request]) => {
    const model: "translate-000" = "translate-000";
    const output = await run(modelDeps, model, {
      request: request.value,
      targetLanguage: targetLanguage.value,
    });
    return { type: "string", value: output.result.trim() };
  },
  triggerTokens: [
    "translate",
    "say",
    "how",
    "write",
    "language",
    "japanese",
    "french",
    "italian",
    "spanish",
    "chinese",
    "english",
    "arabic",
    "portuguese",
    "creole",
    "dutch",
    "danish",
    "catalan",
    "german",
    "greek",
    "icelandic",
    "norwegian",
    "swedish",
    "polish",
    "russian",
    "ukrainian",
    "hungarian",
    // TODO use complete list
  ],
};

const editProse: BuiltinCommandDefinition<["string"]> = {
  description: `edit prose using the given requirements`,
  args: [{ name: "sentence describing desired changes", type: "string" }],
  run: async (modelDeps, reqCtx, [editingRequirement]) => {
    const text = reqCtx.text?.value;
    if (text == null) {
      throw new Error("context text unexpectedly null");
    }
    const output = await run(modelDeps, "passthrough-openai-000", {
      openAiModel: "text-davinci-003",
      request: `Rewrite and edit the following text. The requirement is '${
        editingRequirement.value satisfies string
      }':

${text}`,
    });
    return { type: "string", value: output.result.trim() };
  },
  requestContextRequirement: {
    text: { type: "string" },
  },
  triggerTokens: [
    "edit",
    "change",
    "alter",
    "fix",
    "reword",
    "re-word",
    "editor",
  ],
};

// TODO: maybe a code edit model will do better with this?
const editCode: BuiltinCommandDefinition<["string", "string"]> = {
  description: `edit code using the given requirements`,
  args: [
    { name: "full name of the programming language", type: "string" },
    { name: "sentence describing desired changes", type: "string" },
  ],
  run: async (modelDeps, reqCtx, [language, editingRequirement]) => {
    const text = reqCtx.text?.value;
    if (text == null) {
      throw new Error("context text unexpectedly null");
    }
    const output = await run(modelDeps, "passthrough-openai-000", {
      openAiModel: "text-davinci-003",
      request: `Edit or refactor the code below based on the given requirement.
Programming language is '${
        (reqCtx.language?.value ?? language.value) satisfies string
      }'.
The requirement is '${editingRequirement.value satisfies string}':

${text satisfies string}`,
    });
    return { type: "string", value: output.result.trim() };
  },
  requestContextRequirement: {
    text: { type: "string" },
  },
  triggerTokens: [
    ...PROGRAMMING_LANGUAGES,
    "function",
    "compile",
    "class",
    "variable",
    "code",
    "refactor",
    "re-factor",
    "edit",
    "change",
    "alter",
    "fix",
    "reword",
    "re-word",
    "editor",
    "lint",
  ],
};

const generateCode: BuiltinCommandDefinition<["string", "string", "string"]> = {
  description: `generate code for the given request`,
  args: [
    { name: "full name of target programming language", type: "string" },
    {
      name: "what is being generated (function, class etc)",
      type: "string",
    },
    { name: "verbose description of what the code does", type: "string" },
  ],
  run: async (
    modelDeps,
    reqCtx,
    [targetLanguage, whatIsBeingGenerated, request]
  ) => {
    const model = "code-000" as const;
    const output = await run(modelDeps, model, {
      request: request.value,
      whatIsBeingGenerated: whatIsBeingGenerated.value,
      targetLanguage: targetLanguage.value,
    });
    return { type: "string", value: output.result.trim() };
  },
  triggerTokens: [
    ...PROGRAMMING_LANGUAGES,
    "generate",
    "code",
    "programming",
    "program",
    "write",
    "swift",
    "html",
    "lang",
    "function",
    "class",
    "language",
    "type",
  ],
};

const relativeTime: BuiltinCommandDefinition<["string"]> = {
  description: "get the time relative to now in ISO8601 format",
  args: [
    {
      name: "natural language description of relative time",
      type: "string",
    },
  ],
  run: async (deps, __, [description]) => {
    const d = parseDate(description.value, {
      instant: deps.now(),
      timezone: deps.session.configuration.timezoneUtcOffset,
    });
    if (d == null) {
      throw new HTTPError("could not parse relative time", 500);
    }
    return {
      type: "string",
      value: d.toISOString(),
    };
  },
};

const answer: BuiltinCommandDefinition<["string"]> = {
  description: `store an answer that is readily available if the request is a question`,
  args: [{ name: "answer", type: "string" }],
  run: async (_, __, [answer]) => answer,
};

const fail: BuiltinCommandDefinition<["string"]> = {
  description: `indicate the request could not be interpreted`,
  args: [{ name: "reason", type: "string" }],
  run: async (_, __, [reason]) => reason,
};

const write: BuiltinCommandDefinition<[]> = {
  description: `write/insert the results above into the current context. use sparingly and only if the instruction indicates that results should be written`,
  args: [],
  run: async (_, __, ___) => ({ type: "boolean", value: true }),
};

const display: BuiltinCommandDefinition<[]> = {
  description: `display the results above to the user. should be favored over write() if it makes more sense`,
  args: [],
  run: async (_, __, ___) => ({ type: "boolean", value: true }),
};

export const builtinCommands = {
  display,
  write,
  answer,
  math,
  time,
  editProse,
  editCode,
  generateCode,
  translate,
  fail,
  relativeTime,
};

export default builtinCommands;
