import {
  BuiltinFunctionDefinitionArgs,
  FunctionReturnValue,
  checkArgumentsValid,
  builtinFunctions,
} from "@lib/function.ts";

import { Session } from "@lib/session.ts";
import { Output } from "@lib/models.ts";

type OutputInterceptor = (session: Session, output: Output) => Promise<Output>;

export const interceptors: OutputInterceptor[] = [
  interceptFunctionCall("time", async (session, [timeZone]) => {
    return new Date().toLocaleString(session.globalConfiguration.locale, {
      timeZone,
    });
  }),
];

export default interceptors;

function interceptFunctionCall<N extends keyof typeof builtinFunctions>(
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
      const maybeReturnValue = await fn(session, args);
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
