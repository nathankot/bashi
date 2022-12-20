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

const answer: BuiltinFunctionDefinition<["string"]> = {
  description: `store an answer that is readily available if the request is a question`,
  args: [{ name: "answer", type: "string" }],
};

const flushToSpeech: BuiltinFunctionDefinition<[]> = {
  description: `the results above should be communicated by speech`,
  args: [],
};

const flushToText: BuiltinFunctionDefinition<[]> = {
  description: `the results above should be written/inserted into the current context`,
  args: [],
};

const fail: BuiltinFunctionDefinition<["string"]> = {
  description: `indicate the request could not be interpreted`,
  args: [{ name: "reason", type: "string" }],
};

export const builtinFunctions = {
  answer,
  math,
  time,
  translate,
  fail,
  flushToSpeech,
  flushToText,
};
