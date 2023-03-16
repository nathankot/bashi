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
    const commandArgs: Value[] = [...command.args];
    const isOverloaded = "overloads" in definition;
    const defsToTry =
      "overloads" in definition ? definition.overloads : [definition];

    // Short circuit if any args contain an error:
    for (const arg of commandArgs) {
      if (arg.type === "error")
        return {
          ...command,
          type: "executed",
          returnValue: arg,
        };
    }

    const receivedArgsDescription = `(${commandArgs
      .map((a) => a.type)
      .join(", ")})`;

    if (defsToTry.length === 0) {
      throw new Error(`no overloads found for ${command.name}`);
    }

    for (const definition of defsToTry) {
      if (!checkArgumentsValid(definition, commandArgs)) {
        // Throw immediately if this is not an overloaded function:
        if (!isOverloaded) {
          const expectedArgsDescription = `(${definition.args
            .map((a) => a.type)
            .join(", ")})`;
          throw new Error(
            `function '${command.name}' expects arguments of type ` +
              `${expectedArgsDescription} ` +
              `but got ${receivedArgsDescription}`
          );
        }
        continue;
      }
      const returnValue = await definition.run(deps, commandArgs, memory);
      return {
        ...command,
        type: "executed",
        returnValue,
      };
    }

    throw new Error(
      `no overload found for: ${command.name}${receivedArgsDescription}`
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
