import * as mathjs from "mathjs";
import { parseDate } from "chrono";
import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";

import { PROGRAMMING_LANGUAGES } from "@lib/constants.ts";
import { BuiltinCommandDefinition } from "./types.ts";
import { HTTPError } from "@lib/errors.ts";
import { run as runPassthrough } from "@lib/models/passthroughOpenai000.ts";
import { run as runCode } from "@lib/models/code000.ts";
import { run as runTranslate } from "@lib/models/translate000.ts";

const LOCAL_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX";

const now: BuiltinCommandDefinition<[], "string"> = {
  isBuiltin: true,
  cost: -1000,
  description: "get the users current ISO8601 datetime",
  args: [],
  run: async (deps, []) => ({
    type: "string",
    value: formatInTimeZone(
      deps.now(),
      deps.session.configuration.timezoneName,
      LOCAL_DATETIME_FORMAT
    ),
  }),
  returnType: "string",
};

const parseRelativeTime: BuiltinCommandDefinition<["string"], "string"> = {
  isBuiltin: true,
  cost: 10,
  returnType: "string",
  description: "parse ISO8601 datetime relative to now from natural language",
  args: [
    {
      name: "naturalLanguageRelativeTime",
      type: "string",
    },
  ],
  run: async (deps, [description]) => {
    const d = parseDate(description.value, {
      instant: deps.now(),
      // chronojs expects the offset in minutes:
      timezone:
        getTimezoneOffset(deps.session.configuration.timezoneName) / 1000 / 60,
    });
    if (d == null) {
      throw new HTTPError("could not parse relative time", 500);
    }
    return {
      type: "string",
      value: formatInTimeZone(
        d,
        deps.session.configuration.timezoneName,
        LOCAL_DATETIME_FORMAT
      ),
    };
  },
};

const currentTimeForTimezone: BuiltinCommandDefinition<["string"], "string"> = {
  isBuiltin: true,
  cost: -1000,
  returnType: "string",
  description: `get the ISO8601 datetime for the given timezone`,
  args: [{ name: "tz database timezone name", type: "string" }],
  triggerTokens: ["time", "hour", "clock"],
  run: async ({ log, session, now }, [timeZone]) => {
    return {
      type: "string",
      value: formatInTimeZone(
        now(),
        timeZone.value.replaceAll(" ", "_"),
        LOCAL_DATETIME_FORMAT
      ),
    };
  },
};

const search: BuiltinCommandDefinition<["string"], "string"> = {
  isBuiltin: true,
  cost: 1000,
  description:
    "get a list of (title, link, snippet) search results, must use sparingly only when the answer is not directly known",
  returnType: "string",
  args: [{ name: "query", type: "string" }],
  run: async (modelDeps, [query]) => {
    const results = await modelDeps.googleSearch(query.value, modelDeps.signal);
    return {
      type: "string",
      value: results
        .map((r) => `Title: ${r.title}\nLink: ${r.link}\nSnippet: ${r.snippet}`)
        .join("\n---\n"),
    };
  },
};

const extractInformation: BuiltinCommandDefinition<
  ["string", "string"],
  "string"
> = {
  isBuiltin: true,
  cost: 100,
  returnType: "string",
  description:
    "summarize or extract arbitrary information from input text/code",
  args: [
    { name: "full description of what to extract", type: "string" },
    { name: "input", type: "string" },
  ],
  run: async (modelDeps, [desc, input]) => {
    const output = await runPassthrough(
      modelDeps,
      { model: "passthrough-openai-000" },
      {
        openAiModel: "text-davinci-003",
        request: `Condense/summarize/extract information from text that follows. The output should satisfy the requirement:\n${desc.value}\n\nThe text is:\n${input.value}\n\nResult:\n"`,
      }
    );
    return {
      type: "string",
      value: output.result,
    };
  },
};

const math: BuiltinCommandDefinition<["string"], "string"> = {
  isBuiltin: true,
  cost: -1000,
  returnType: "string",
  description: `compute a math formula`,
  args: [{ name: "a mathjs expression ", type: "string" }],
  run: async ({ log, session }, [expr]) => {
    try {
      const result = mathjs.evaluate(expr.value);
      return { type: "string", value: `${result satisfies string}` };
    } catch (e) {
      log("info", "failed to parse math: " + expr.value);
      throw new HTTPError(e, 500);
    }
  },
};

const translate: BuiltinCommandDefinition<["string", "string"], "string"> = {
  isBuiltin: true,
  cost: 100,
  returnType: "string",
  description: `translate something into a target language`,
  args: [
    { name: "full name of the target language", type: "string" },
    { name: "string to translate", type: "string" },
  ],
  run: async (modelDeps, [targetLanguage, request]) => {
    const output = await runTranslate(
      modelDeps,
      { model: "translate-000" },
      {
        request: request.value,
        targetLanguage: targetLanguage.value,
      }
    );
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

const editProse: BuiltinCommandDefinition<["string", "string"], "string"> = {
  isBuiltin: true,
  cost: 100,
  returnType: "string",
  description: `edit prose using the given requirements`,
  args: [
    { name: "prose to edit", type: "string" },
    { name: "full description of all desired changes", type: "string" },
  ],
  run: async (modelDeps, [text, editingRequirement]) => {
    const output = await runPassthrough(
      modelDeps,
      { model: "passthrough-openai-000" },
      {
        openAiModel: "text-davinci-003",
        request: `Rewrite and edit the following text. The requirement is '${
          editingRequirement.value satisfies string
        }':

${text.value}`,
      }
    );
    return { type: "string", value: output.result.trim() };
  },
  triggerTokens: [
    "edit",
    "change",
    "alter",
    "fix",
    "reword",
    "re-word",
    "editor",
    "improve",
    "check",
    "revise",
    "modify",
    "adapt",
    "rewrite",
    "re-write",
  ],
};

// TODO: maybe a code edit model will do better with this?
const editCode: BuiltinCommandDefinition<
  ["string", "string", "string"],
  "string"
> = {
  isBuiltin: true,
  cost: 100,
  returnType: "string",
  description: `edit code using the given requirements`,
  args: [
    { name: "code to edit", type: "string" },
    { name: "programming language name", type: "string" },
    { name: "full description of all desired changes", type: "string" },
  ],
  run: async (modelDeps, [text, language, editingRequirement]) => {
    const output = await runPassthrough(
      modelDeps,
      { model: "passthrough-openai-000" },
      {
        openAiModel: "text-davinci-003",
        request: `Edit or refactor the code below based on the given requirement.
Programming language is '${language.value satisfies string}'.
The requirement is '${editingRequirement.value satisfies string}':

${text.value satisfies string}`,
      }
    );
    return { type: "string", value: output.result.trim() };
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
    "improve",
    "check",
    "revise",
    "modify",
    "adapt",
    "rewrite",
    "re-write",
  ],
};

const generateCode: BuiltinCommandDefinition<["string", "string"], "string"> = {
  isBuiltin: true,
  cost: 10,
  returnType: "string",
  description: `generate code for the given request`,
  args: [
    { name: "full name of target programming language", type: "string" },
    {
      name: "verbose description of what code is being generated",
      type: "string",
    },
  ],
  run: async (modelDeps, [targetLanguage, request]) => {
    const output = await runCode(
      modelDeps,
      { model: "code-000" },
      {
        request: request.value,
        programmingLanguage: targetLanguage.value,
      }
    );
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

export const builtinCommands = {
  now,
  math,
  currentTimeForTimezone,
  editProse,
  editCode,
  generateCode,
  translate,
  parseRelativeTime,
  extractInformation,
  search,
};

export default builtinCommands;
