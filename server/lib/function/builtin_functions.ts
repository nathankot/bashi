import { BuiltinFunctionDefinition } from "./types.ts";

const time: BuiltinFunctionDefinition<["string"]> = {
  description: `check the time for the given timezone`,
  args: [{ name: "tz database timezone name", type: "string" }],
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

const respond: BuiltinFunctionDefinition<["string"]> = {
  description: `specify the response to a question`,
  args: [{ name: "the concrete answer to the question", type: "string" }],
};

const write: BuiltinFunctionDefinition<[]> = {
  description: `write the result of the function in the line above into the current context`,
  args: [],
};

const say: BuiltinFunctionDefinition<[]> = {
  description: `speak the result of the function in the line above`,
  args: [],
};

export const builtinFunctions = {
  time,
  math,
  respond,
  translate,
  write,
  say,
};
