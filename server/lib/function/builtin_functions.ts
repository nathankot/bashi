import { BuiltinFunctionDefinition } from "./types.ts";

const time: BuiltinFunctionDefinition<["string"]> = {
  description: `check the time for the given timezone`,
  args: [{ name: "tz database timezone name", type: "string" }],
  triggerTokens: ["time", "hour", "clock"],
};

const math: BuiltinFunctionDefinition<["string"]> = {
  description: `compute a math formula`,
  args: [{ name: "a math.js expression", type: "string" }],
};

const translate: BuiltinFunctionDefinition<["string", "string"]> = {
  description: `translate something into a target language`,
  args: [
    { name: "full name of the target language", type: "string" },
    { name: "string to translate", type: "string" },
  ],
};

const fact: BuiltinFunctionDefinition<["string"]> = {
  description: `set the answer if you know the answer to the request as a fact`,
  args: [{ name: "answer", type: "string" }],
};

const write: BuiltinFunctionDefinition<[]> = {
  description: `write the result of the function in the line above into the current context`,
  args: [],
};

const say: BuiltinFunctionDefinition<[]> = {
  description: `speak the result of the function in the line above`,
  args: [],
};

const ask: BuiltinFunctionDefinition<["string"]> = {
  description: `ask a clarifying question about the request`,
  args: [{ name: "question", type: "string" }],
};

const notSupported: BuiltinFunctionDefinition<["string"]> = {
  description: `indicate why the request is not supported`,
  args: [{ name: "reason", type: "string" }],
};

export const builtinFunctions = {
  ask,
  math,
  notSupported,
  fact,
  say,
  time,
  translate,
  write,
};
