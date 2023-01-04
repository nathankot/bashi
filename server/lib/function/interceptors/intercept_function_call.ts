import * as t from "io-ts";

import { ModelInterceptor } from "@lib/interceptors.ts";

import {
  BuiltinFunctionDefinitionArgs,
  FunctionReturnValue,
  FunctionCalls,
  checkArgumentsValid,
  builtinFunctions,
} from "@lib/function.ts";

import { ModelName, models } from "@lib/models.ts";

import { RequestContextDef, RequestContext } from "@lib/requestContext.ts";

export function interceptFunctionCall<
  N extends Extract<
    t.TypeOf<typeof models[ModelName]["Output"]>,
    { model: string; functionCalls: FunctionCalls }
  >["model"],
  FN extends keyof typeof builtinFunctions
>(
  fnName: FN,
  interceptFn: (
    deps: Parameters<ModelInterceptor<N>>[0],
    input: t.TypeOf<typeof models[N]["Input"]>,
    args: BuiltinFunctionDefinitionArgs<typeof builtinFunctions[FN]["args"]>
  ) => Promise<FunctionReturnValue | null>,
  validateFn?: (reqCtx: RequestContext) => Promise<true | RequestContextDef>
): {
  fnName: FN;
  interceptor: ModelInterceptor<N>;
  validateRequestContext: NonNullable<typeof validateFn>;
} {
  const interceptor: ModelInterceptor<N> = async (deps, input, output) => {
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
        typeof builtinFunctions[FN]["args"]
      >;
      try {
        const maybeReturnValue = await interceptFn(deps, input, args);
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
          invalidReason: "failed_execution",
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
