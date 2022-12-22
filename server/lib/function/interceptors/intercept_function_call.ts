import { OutputInterceptor } from "@lib/interceptors.ts";

import {
  BuiltinFunctionDefinitionArgs,
  FunctionReturnValue,
  checkArgumentsValid,
  builtinFunctions,
  FunctionCalls,
} from "@lib/function.ts";

import { AllOutput } from "@lib/models.ts";

export function interceptFunctionCall<
  O extends AllOutput & { functionCalls: FunctionCalls },
  N extends keyof typeof builtinFunctions
>(
  fnName: N,
  fn: (
    deps: Parameters<OutputInterceptor<O>>[0],
    args: BuiltinFunctionDefinitionArgs<typeof builtinFunctions[N]["args"]>
  ) => Promise<FunctionReturnValue | null>
): OutputInterceptor<O> {
  return async (deps, output) => {
    if (!("functionCalls" in output)) {
      return output;
    }

    const { log } = deps;
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
        const maybeReturnValue = await fn(deps, args);
        if (maybeReturnValue == null) {
          continue;
        }
        newFunctionCalls[i] = {
          ...call,
          type: "executed",
          returnValue: maybeReturnValue,
        };
      } catch (e) {
        log("error", e);
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
