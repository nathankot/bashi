import { PROGRAMMING_LANGUAGES } from "@lib/constants.ts";
import { BuiltinFunctionDefinition } from "./types.ts";

const time: BuiltinFunctionDefinition<["string"]> = {
  description: `check the time for the given timezone`,
  args: [{ name: "tz database timezone name", type: "string" }],
  triggerTokens: ["time", "hour", "clock"],
};

const math: BuiltinFunctionDefinition<["string"]> = {
  description: `compute a math formula`,
  args: [{ name: "a mathjs expression ", type: "string" }],
};

const translate: BuiltinFunctionDefinition<["string", "string"]> = {
  description: `translate something into a target language`,
  args: [
    { name: "full name of the target language", type: "string" },
    { name: "string to translate", type: "string" },
  ],
};

const editProse: BuiltinFunctionDefinition<["string"]> = {
  description: `edit prose using the given requirements`,
  args: [{ name: "sentence describing desired changes", type: "string" }],
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
const editCode: BuiltinFunctionDefinition<["string", "string"]> = {
  description: `edit code using the given requirements`,
  args: [
    { name: "full name of the programming language", type: "string" },
    { name: "sentence describing desired changes", type: "string" },
  ],
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

const generateCode: BuiltinFunctionDefinition<["string", "string", "string"]> =
  {
    description: `generate code for the given request`,
    args: [
      { name: "full name of target programming language", type: "string" },
      {
        name: "what is being generated (function, class etc)",
        type: "string",
      },
      { name: "verbose description of what the code does", type: "string" },
    ],
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

const answer: BuiltinFunctionDefinition<["string"]> = {
  description: `store an answer that is readily available if the request is a question`,
  args: [{ name: "answer", type: "string" }],
  mustNotBeDisabled: true,
};

const flushToSpeech: BuiltinFunctionDefinition<[]> = {
  description: `the results above should be communicated by speech`,
  args: [],
  mustNotBeDisabled: true,
};

const flushToText: BuiltinFunctionDefinition<[]> = {
  description: `the results above should be written/inserted into the current context`,
  args: [],
  mustNotBeDisabled: true,
};

const fail: BuiltinFunctionDefinition<["string"]> = {
  description: `indicate the request could not be interpreted`,
  args: [{ name: "reason", type: "string" }],
  mustNotBeDisabled: true,
};

export const builtinFunctions = {
  answer,
  math,
  time,
  editProse,
  editCode,
  generateCode,
  translate,
  fail,
  flushToSpeech,
  flushToText,
};

export default builtinFunctions;
