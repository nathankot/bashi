import {
  BuiltinFunctionDefinitionArgs,
  FunctionReturnValue,
  checkArgumentsValid,
  builtinFunctions,
} from "@lib/function.ts";
import { Output } from "@lib/models.ts";

type OutputInterceptor = (output: Output) => Promise<Output>;

export const interceptors: OutputInterceptor[] = [
  interceptFunctionCall("time", async ([timeZone]) => {
    return new Date().toLocaleString("en-US", {
      timeZone,
    });
  }),
];

export default interceptors;

function interceptFunctionCall<N extends keyof typeof builtinFunctions>(
  fnName: N,
  fn: (
    args: BuiltinFunctionDefinitionArgs<typeof builtinFunctions[N]["args"]>
  ) => Promise<FunctionReturnValue | null>
): OutputInterceptor {
  return async (output) => {
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
      const maybeReturnValue = await fn(args);
      if (maybeReturnValue == null) {
        continue;
      }
      newFunctionCalls[i] = {
        ...call,
        type: "parsed_and_executed",
        returnValue: maybeReturnValue,
      };
    }

    return {
      ...output,
      functionCalls: newFunctionCalls,
    };
  };
}
