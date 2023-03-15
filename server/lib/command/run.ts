import { ModelDeps } from "@lib/models.ts";
import { Value } from "@lib/valueTypes.ts";

import {
  AnyBuiltinCommandDefinition,
  CommandParsed,
  CommandExecuted,
  Memory,
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

export async function runBuiltinCommand(
  definition:
    | AnyBuiltinCommandDefinition
    | { overloads: AnyBuiltinCommandDefinition[] },
  deps: ModelDeps,
  command: CommandParsed,
  memory: Memory
): Promise<CommandExecuted> {
  try {
    const isOverloaded = "overloads" in definition;
    const defsToTry =
      "overloads" in definition ? definition.overloads : [definition];

    const args = [...command.args];

    for (const definition of defsToTry) {
      if (!checkArgumentsValid(definition, args)) {
        continue;
      }
      const returnValue = await definition.run(deps, args, memory);
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
  } catch (e) {
    return {
      type: "executed",
      id: command.id,
      args: command.args,
      name: command.name,
      returnValue: { type: "error", message: e.message },
    };
  }
}
