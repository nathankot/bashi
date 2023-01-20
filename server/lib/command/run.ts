import {
  RequestContext,
  RequestContextRequirement,
} from "@lib/requestContext.ts";

import { ModelDeps } from "@lib/models.ts";
import { Value, ValueForType } from "@lib/valueTypes.ts";

import {
  Argument,
  ArgumentType,
  CommandParsed,
  CommandExecuted,
} from "./types.ts";

export function checkArgumentsValid<A extends Argument[]>(
  definition: {
    args: { [K in keyof A]: { type: A[K]["type"]; name: string } };
  },
  args: Argument[]
): args is A {
  if (definition.args.length !== args.length) {
    return false;
  }
  for (let i = 0; i < definition.args.length; i++) {
    const argDef = definition.args[i]!;
    const arg = args[i]!;
    if (arg.type !== argDef.type) {
      return false;
    }
  }
  return true;
}

export function checkRequestContext<
  D extends { requestContextRequirement?: RequestContextRequirement }
>(
  definition: D,
  requestContext: RequestContext
): true | RequestContextRequirement {
  let missingRequirements = {
    ...definition.requestContextRequirement,
  };
  for (const [key, value] of Object.entries(requestContext)) {
    const maybeRequirement = missingRequirements[key];
    if (maybeRequirement == null) {
      continue;
    }
    if (maybeRequirement.type === value.type) {
      delete missingRequirements[key];
    }
  }
  if (Object.entries(missingRequirements).length === 0) {
    return true;
  }
  return missingRequirements;
}

export async function runBuiltinCommand<A extends ArgumentType[]>(
  definition: {
    args: { [K in keyof A]: { name: string; type: A[K] } };
    run: (
      deps: ModelDeps,
      input: RequestContext,
      args: { [K in keyof A]: ValueForType<A[K]> }
    ) => Promise<Value>;
    requestContextRequirement?: RequestContextRequirement;
  },
  deps: ModelDeps,
  requestContext: RequestContext,
  command: CommandParsed
): Promise<CommandExecuted> {
  const args = command.args;
  if (!checkArgumentsValid(definition, args)) {
    throw new Error("arguments are invalid");
  }
  if (!checkRequestContext(definition, requestContext)) {
    throw new Error("request context requirements are missing");
  }
  const returnValue = await definition.run(deps, requestContext, args as any);
  return {
    type: "executed",
    returnValue,
    id: command.id,
    args: command.args,
    name: command.name,
  };
}
