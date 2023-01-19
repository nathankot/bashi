import * as t from "io-ts";

import {
  RequestContext,
  RequestContextRequirement,
} from "@lib/requestContext.ts";

import { ModelDeps, models } from "@lib/models.ts";
import { ValueType, ValueForType } from "@lib/valueTypes.ts";

import { CommandSupportedModels } from "./supportedModels.ts";
import {
  Argument,
  ArgumentType,
  Command,
  CommandDefinition,
  BuiltinCommandDefinition,
} from "./types.ts";

export function checkArgumentsValid(
  knownCommand: CommandDefinition,
  args: Argument[]
): boolean {
  if (knownCommand.args.length !== args.length) {
    return false;
  }
  for (let i = 0; i < knownCommand.args.length; i++) {
    const argDef = knownCommand.args[i]!;
    const arg = args[i]!;
    if (arg.type !== argDef.type) {
      return false;
    }
  }
  return true;
}

export function checkRequestContext<
  A extends ArgumentType[],
  R extends ValueType
>(
  definition: BuiltinCommandDefinition<A, R>,
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

export async function runBuiltinCommand<
  N extends CommandSupportedModels,
  A extends ArgumentType[],
  R extends ValueType
>(
  definition: BuiltinCommandDefinition<A, R>,
  deps: ModelDeps,
  input: t.TypeOf<typeof models[N]["Input"]>,
  command: Command
): Promise<Command> {
  if (command.type !== "parsed") {
    throw new Error("command type is must be 'parsed'");
  }
  const args = command.args;
  if (!checkBuiltinCommandArgumentsValid(definition, args)) {
    throw new Error("arguments are invalid");
  }
  if (!checkRequestContext(definition, input.requestContext ?? {})) {
    throw new Error("request context requirements are missing");
  }
  const returnValue = await definition.run(
    deps,
    input.requestContext ?? {},
    args
  );
  return {
    type: "executed",
    returnValues: [returnValue],
    id: command.id,
    args: command.args,
    line: command.line,
    name: command.name,
  };
}

function checkBuiltinCommandArgumentsValid<
  A extends ArgumentType[],
  R extends ValueType
>(
  knownCommand: BuiltinCommandDefinition<A, R>,
  args: Argument[]
): args is { [K in keyof A]: ValueForType<A[K]> } {
  return checkArgumentsValid(knownCommand, args);
}
