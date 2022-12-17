import {
  FunctionCall,
  FunctionSet,
  FunctionDefinition,
  FunctionCallArgument,
} from "./function/types.ts";
import { evaluate } from "./function/parser.ts";

export * from "./function/types.ts";
export * from "./function/parser.ts";

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
          type: "parsed_but_invalid",
          invalid_reason: "unknown_function",
        });
        continue;
      }
      if (!checkArgumentTypes(knownFunction, parsed.args)) {
        result.push({
          ...parsed,
          type: "parsed_but_invalid",
          invalid_reason: "invalid arguments",
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

function checkArgumentTypes(
  knownFunction: FunctionDefinition,
  args: FunctionCallArgument[]
): boolean {
  if (knownFunction.args.length !== args.length) {
    return false;
  }
  for (let i = 0; i < knownFunction.args.length; i++) {
    const argDef = knownFunction.args[i]!;
    const arg = args[i]!;
    switch (argDef.type) {
      case "boolean":
        if (typeof arg !== "boolean") {
          return false;
        }
        continue;
      case "number":
        if (typeof arg !== "number") {
          return false;
        }
        continue;
      case "string":
        if (typeof arg !== "string") {
          return false;
        }
        continue;
      default:
        const exhaustiveCheck: never = argDef.type;
        throw new Error(`unexpected arg type: ${exhaustiveCheck}`);
    }
  }
  return true;
}
