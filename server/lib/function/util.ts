import {
  FunctionCall,
  FunctionSet,
  FunctionDefinition,
  FunctionCallArgument,
} from "./types.ts";

import { evaluate } from "./parser.ts";

export function parseFromModelResult(
  knownFunctions: FunctionSet,
  text: string
): FunctionCall[] {
  let result: FunctionCall[] = [];

  for (const line of text.split("\n")) {
    if (line.trim() === "") {
      continue;
    }
    if (line === "```") {
      continue;
    }
    try {
      const parsed = evaluate(line);
      const knownFunction = knownFunctions[parsed.name];
      // Check that the function is known
      if (knownFunction == null) {
        result.push({
          ...parsed,
          type: "invalid",
          invalid_reason: "unknown_function",
        });
        continue;
      }
      if (!checkArgumentsValid(knownFunction, parsed.args)) {
        result.push({
          ...parsed,
          type: "invalid",
          invalid_reason: "invalid_arguments",
        });
        continue;
      }
      result.push(parsed);
    } catch (e) {
      result.push({
        type: "parse_error",
        line,
        error: (e as any).message ?? "",
      });
    }
  }

  return result;
}

export function checkArgumentsValid(
  knownFunction: FunctionDefinition,
  args: FunctionCallArgument[]
): boolean {
  if (knownFunction.args.length !== args.length) {
    return false;
  }
  for (let i = 0; i < knownFunction.args.length; i++) {
    const argDef = knownFunction.args[i]!;
    const arg = args[i]!;
    if (typeof arg !== argDef.type) {
      return false;
    }
  }
  return true;
}
