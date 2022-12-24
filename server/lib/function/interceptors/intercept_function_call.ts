import { OutputInterceptor } from "@lib/interceptors.ts";

import {
  BuiltinFunctionDefinitionArgs,
  FunctionReturnValue,
  checkArgumentsValid,
  builtinFunctions,
  FunctionCalls,
} from "@lib/function.ts";

import { AllOutput } from "@lib/models.ts";

import { RequestContextDef, RequestContext } from "@lib/request_context.ts";

export function interceptFunctionCall<
  O extends Extract<AllOutput, { functionCalls: FunctionCalls }>,
  N extends keyof typeof builtinFunctions
>(
  fnName: N,
  interceptFn: (
    deps: Parameters<OutputInterceptor<O>>[0],
    args: BuiltinFunctionDefinitionArgs<typeof builtinFunctions[N]["args"]>
  ) => Promise<FunctionReturnValue | null>,
  validateFn?: (reqCtx: RequestContext) => Promise<true | RequestContextDef>
): {
  fnName: N;
  interceptor: OutputInterceptor<O>;
  validateRequestContext: NonNullable<typeof validateFn>;
} {
  const interceptor: OutputInterceptor<O> = async (deps, output) => {
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
        const maybeReturnValue = await interceptFn(deps, args);
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

  const validateRequestContext = validateFn ?? (async () => true);

  return {
    fnName,
    interceptor,
    validateRequestContext,
  };
}
