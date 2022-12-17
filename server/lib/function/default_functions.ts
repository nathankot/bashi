import { FunctionSet } from "./types.ts";

export const defaultFunctions: FunctionSet = {
  time: {
    description: `check the time for the given timezone`,
    args: [{ name: "tz database timezone name", type: "string" }],
  },
  math: {
    description: `compute a math formula`,
    args: [{ name: "a math.js expression", type: "string" }],
  },
  respond: {
    description: `respond to a general question`,
    args: [{ name: "the concrete answer to the question", type: "string" }],
  },
};
