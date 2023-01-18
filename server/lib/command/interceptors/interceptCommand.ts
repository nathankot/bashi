import * as t from "io-ts";

import { ModelInterceptor } from "@lib/interceptors.ts";
import { CommandSupportedModels as SupportedModels } from "@lib/command/supportedModels.ts";

import {
  BuiltinCommandDefinitionArgs,
  CommandReturnValue,
  checkArgumentsValid,
  builtinCommands,
} from "@lib/command.ts";

import { models } from "@lib/models.ts";

import {
  RequestContextRequirement,
  RequestContext,
} from "@lib/requestContext.ts";

export function interceptCommand<
  N extends SupportedModels,
  FN extends keyof typeof builtinCommands
>(
  commandName: FN,
  interceptFn: (
    deps: Parameters<ModelInterceptor<N>>[1],
    input: t.TypeOf<typeof models[N]["Input"]>,
    args: BuiltinCommandDefinitionArgs<typeof builtinCommands[FN]["args"]>
  ) => Promise<CommandReturnValue[] | null>,
  validateFn?: (
    reqCtx: RequestContext
  ) => Promise<true | RequestContextRequirement>
): {
  commandName: FN;
  interceptor: ModelInterceptor<N>;
  validateRequestContext: NonNullable<typeof validateFn>;
} {
  const interceptor: ModelInterceptor<N> = async (
    modelName,
    deps,
    input,
    output
  ) => {
    if (!("result" in output)) {
      return output;
    }
    const result = output.result;
    if (result.type !== "ok") {
      return output;
    }
    const { log } = deps;
    const fnDef = builtinCommands[commandName];
    const newCommands = [...result.commands];
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
        const maybeReturnValues = await interceptFn(deps, input, args);
        if (maybeReturnValues == null) {
          continue;
        }
        newCommands[i] = {
          ...call,
          type: "executed",
          returnValues: maybeReturnValues,
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
      result: {
        ...result,
        commands: newCommands,
      },
    };
  };

  const validateRequestContext = validateFn ?? (async () => true);

  return {
    commandName,
    interceptor,
    validateRequestContext,
  };
}
