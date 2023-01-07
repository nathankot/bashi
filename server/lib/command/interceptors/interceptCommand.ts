import * as t from "io-ts";

import { ModelInterceptor } from "@lib/interceptors.ts";

import {
  BuiltinCommandDefinitionArgs,
  CommandReturnValue,
  Commands,
  checkArgumentsValid,
  builtinCommands,
} from "@lib/command.ts";

import { ModelName, models } from "@lib/models.ts";

import {
  RequestContextRequirement,
  RequestContext,
} from "@lib/requestContext.ts";

export function interceptCommand<
  N extends Extract<
    t.TypeOf<typeof models[ModelName]["Output"]>,
    { model: string; commands: Commands }
  >["model"],
  FN extends keyof typeof builtinCommands
>(
  commandName: FN,
  interceptFn: (
    deps: Parameters<ModelInterceptor<N>>[0],
    input: t.TypeOf<typeof models[N]["Input"]>,
    args: BuiltinCommandDefinitionArgs<typeof builtinCommands[FN]["args"]>
  ) => Promise<CommandReturnValue | null>,
  validateFn?: (
    reqCtx: RequestContext
  ) => Promise<true | RequestContextRequirement>
): {
  commandName: FN;
  interceptor: ModelInterceptor<N>;
  validateRequestContext: NonNullable<typeof validateFn>;
} {
  const interceptor: ModelInterceptor<N> = async (deps, input, output) => {
    if (!("commands" in output)) {
      return output;
    }

    const { log } = deps;
    const fnDef = builtinCommands[commandName];
    const newCommands = [...output.commands];
    for (let i = 0; i < newCommands.length; i++) {
      const call = newCommands[i]!;
      if (call.type !== "parsed") {
        continue;
      }
      if (call.name !== commandName) {
        continue;
      }
      if (!checkArgumentsValid(fnDef, call.args)) {
        continue;
      }
      const args = call.args as BuiltinCommandDefinitionArgs<
        typeof builtinCommands[FN]["args"]
      >;
      try {
        const maybeReturnValue = await interceptFn(deps, input, args);
        if (maybeReturnValue == null) {
          continue;
        }
        newCommands[i] = {
          ...call,
          type: "executed",
          returnValue: maybeReturnValue,
        };
      } catch (e) {
        log("error", e);
        newCommands[i] = {
          ...call,
          type: "invalid",
          invalidReason: "failed_execution",
        };
      }
    }

    return {
      ...output,
      commands: newCommands,
    };
  };

  const validateRequestContext = validateFn ?? (async () => true);

  return {
    commandName,
    interceptor,
    validateRequestContext,
  };
}
