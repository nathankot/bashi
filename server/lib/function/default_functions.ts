import { KnownFunctionDefinition } from "./types.ts";

const time: KnownFunctionDefinition<["string"]> = {
  description: `check the time for the given timezone`,
  args: [{ name: "tz database timezone name", type: "string" }],
};

const math: KnownFunctionDefinition<["string"]> = {
  description: `compute a math formula`,
  args: [{ name: "a math.js expression", type: "string" }],
};

const respond: KnownFunctionDefinition<["string"]> = {
  description: `respond to a general question`,
  args: [{ name: "the concrete answer to the question", type: "string" }],
};

export const defaultFunctions = {
  time,
  math,
  respond,
};
