import {
  RequestContext,
  RequestContextRequirement,
} from "@lib/requestContext.ts";

import { ModelDeps } from "@lib/models.ts";
import { Value } from "@lib/valueTypes.ts";

import {
  AnyBuiltinCommandDefinition,
  CommandParsed,
  CommandExecuted,
} from "./types.ts";

export function checkArgumentsValid<A extends Value[]>(
  definition: {
    args: { [K in keyof A]: { type: A[K]["type"]; name: string } };
  },
  args: Value[]
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

export function checkRequestContext(
  requirement: RequestContextRequirement | null | undefined,
  requestContext: RequestContext
): true | RequestContextRequirement {
  let missingRequirements = {
    ...requirement,
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

export async function runBuiltinCommand(
  definition:
    | AnyBuiltinCommandDefinition
    | { overloads: AnyBuiltinCommandDefinition[] },
  deps: ModelDeps,
  requestContext: RequestContext,
  command: CommandParsed
): Promise<CommandExecuted> {
  const isOverloaded = "overloads" in definition;
  const defsToTry =
    "overloads" in definition ? definition.overloads : [definition];

  const args = command.args;
  for (const definition of defsToTry) {
    if (!checkArgumentsValid(definition, args)) {
      continue;
    }
    if (
      !checkRequestContext(definition.requestContextRequirement, requestContext)
    ) {
      throw new Error("request context requirements are missing");
    }
    const returnValue = await definition.run(deps, requestContext, args);
    return {
      type: "executed",
      returnValue,
      id: command.id,
      args: command.args,
      name: command.name,
    };
  }

  if (!isOverloaded) {
    throw new Error(`arguments are invalid`);
  }

  throw new Error(
    `no overload found for: ${command.name}(${command.args
      .map((a) => a.type)
      .join(", ")})`
  );
}
