import {
  BuiltinFunctionDefinitionArgs,
  FunctionReturnValue,
  checkArgumentsValid,
  builtinFunctions,
} from "@lib/function.ts";

import { Session } from "@lib/session.ts";

import { OutputInterceptor } from "./type.ts";

export function interceptFunctionCall<N extends keyof typeof builtinFunctions>(
  fnName: N,
  fn: (
    session: Session,
    args: BuiltinFunctionDefinitionArgs<typeof builtinFunctions[N]["args"]>
  ) => Promise<FunctionReturnValue | null>
): OutputInterceptor {
  return async (session, output) => {
    if (!("functionCalls" in output)) {
      return output;
    }

    const fnDef = builtinFunctions[fnName];
    const newFunctionCalls = [...output.functionCalls];
    for (let i = 0; i < newFunctionCalls.length; i++) {
      const call = newFunctionCalls[i]!;
      if (call.type !== "parsed") {
        continue;
      }
      if (call.name !== fnName) {
        continue;
      }
      if (!checkArgumentsValid(fnDef, call.args)) {
        continue;
      }
      const args = call.args as BuiltinFunctionDefinitionArgs<
        typeof builtinFunctions[N]["args"]
      >;
      try {
        const maybeReturnValue = await fn(session, args);
        if (maybeReturnValue == null) {
          continue;
        }
        newFunctionCalls[i] = {
          ...call,
          type: "executed",
          returnValue: maybeReturnValue,
        };
      } catch (e) {
        console.error(e);
        newFunctionCalls[i] = {
          ...call,
          type: "invalid",
          invalid_reason: "failed_execution",
        };
      }
    }

    return {
      ...output,
      functionCalls: newFunctionCalls,
    };
  };
}
