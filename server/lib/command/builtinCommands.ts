import { PROGRAMMING_LANGUAGES } from "@lib/constants.ts";
import { BuiltinCommandDefinition } from "./types.ts";

const time: BuiltinCommandDefinition<["string"]> = {
  description: `check the time for the given timezone`,
  args: [{ name: "tz database timezone name", type: "string" }],
  triggerTokens: ["time", "hour", "clock"],
};

const math: BuiltinCommandDefinition<["string"]> = {
  description: `compute a math formula`,
  args: [{ name: "a mathjs expression ", type: "string" }],
};

const translate: BuiltinCommandDefinition<["string", "string"]> = {
  description: `translate something into a target language`,
  args: [
    { name: "full name of the target language", type: "string" },
    { name: "string to translate", type: "string" },
  ],
};

const editProse: BuiltinCommandDefinition<["string"]> = {
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
const editCode: BuiltinCommandDefinition<["string", "string"]> = {
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

const answer: BuiltinCommandDefinition<["string"]> = {
  description: `store an answer that is readily available if the request is a question`,
  args: [{ name: "answer", type: "string" }],
  mustNotBeDisabled: true,
};

const fail: BuiltinCommandDefinition<["string"]> = {
  description: `indicate the request could not be interpreted`,
  args: [{ name: "reason", type: "string" }],
  mustNotBeDisabled: true,
};

const write: BuiltinCommandDefinition<[]> = {
  description: `write/insert the results above into the current context. use sparingly and only if the instruction indicates that results should be written`,
  args: [],
  mustNotBeDisabled: true,
};

const display: BuiltinCommandDefinition<[]> = {
  description: `display the results above to the user. should be favored over write() if it makes more sense`,
  args: [],
  mustNotBeDisabled: true,
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
};

export default builtinCommands;
