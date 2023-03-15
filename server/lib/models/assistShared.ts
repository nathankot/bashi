import * as t from "io-ts";

import {
  BuiltinCommandDefinition,
  AnyBuiltinCommandDefinition,
  Command,
  CommandExecuted,
  CommandParsed,
  Expr,
} from "@lib/command.ts";

import { Value, ValueType, ValueForType } from "@lib/valueTypes.ts";

export const Input = t.partial({
  request: t.string,
  resolvedCommands: t.record(t.string, Value),
});
export type Input = t.TypeOf<typeof Input>;

export const ResultFinished = t.type({
  type: t.literal("finished"),
  results: t.array(Value),
});
export type ResultFinished = t.TypeOf<typeof ResultFinished>;

export const ResultPendingCommands = t.type({
  type: t.literal("pending_commands"),
  pendingCommands: t.array(Command),
  results: t.array(Value),
});
export type ResultPendingCommands = t.TypeOf<typeof ResultPendingCommands>;

export const Result = t.union([ResultFinished, ResultPendingCommands]);
export type Result = t.TypeOf<typeof Result>;

export function overload<
  LHS extends ValueType,
  RHS extends ValueType,
  R extends ValueType
>(
  lhs: LHS,
  rhs: RHS,
  returnType: R,
  fn: (lhs: ValueForType<LHS>, rhs: ValueForType<RHS>) => ValueForType<R>
): AnyBuiltinCommandDefinition {
  return {
    isBuiltin: true,
    description: `overload for ${lhs}, ${rhs} => ${returnType}`,
    args: [
      { name: "lhs", type: lhs },
      { name: "rhs", type: rhs },
    ],
    returnType,
    run: async (_, [lhs, rhs]) => fn(lhs, rhs),
  };
}

// Commands that the model implicitly knows, does not need to be
// sent to the model explicitly.
export const languageBuiltinCommands = {
  $ref: {
    isBuiltin: true,
    description: "retrieve a variable",
    args: [{ name: "identifier", type: "string" }],
    returnType: "mixed",
    run: async (_, [iden], memory) => {
      const maybeValue = memory.variables[iden.value];
      if (maybeValue != null) {
        return maybeValue;
      }
      if (iden.value.toLowerCase() === "result") {
        const maybeLastResult = [...memory.topLevelResults]
          .reverse()
          .filter((r) => r.type !== "void")[0];
        if (maybeLastResult != null) {
          return maybeLastResult;
        }
      }
      throw new Error(`the variable '${iden.value}' does not exist`);
    },
  } as BuiltinCommandDefinition<["string"], "mixed">,
  "__=__": {
    overloads: ValueType.types
      .map((t) => t.value)
      .map(
        (t): AnyBuiltinCommandDefinition => ({
          isBuiltin: true,
          description: "assign a variable",
          args: [
            { name: "identifier", type: "string" },
            { name: "value", type: t },
          ],
          returnType: t,
          run: async (_, [lhs, rhs], memory) => {
            memory.variables[lhs.value] = rhs;
            return rhs;
          },
        })
      ),
  },
  "__+__": {
    overloads: [
      overload("number", "number", "number", (l, r) => ({
        type: "number",
        value: l.value + r.value,
      })),
      overload("string", "string", "string", (l, r) => ({
        type: "string",
        value: l.value + r.value,
      })),
      overload("number", "string", "string", (l, r) => ({
        type: "string",
        value: l.value.toString() + r.value,
      })),
      overload("string", "number", "string", (l, r) => ({
        type: "string",
        value: l.value + r.value.toString(),
      })),
      overload("boolean", "string", "string", (l, r) => ({
        type: "string",
        value: (l.value === true ? "true" : "false") + r.value,
      })),
      overload("string", "boolean", "string", (l, r) => ({
        type: "string",
        value: l.value + (r.value === true ? "true" : "false"),
      })),
    ],
  },
};

export function getPendingCommandsOrResult(
  commandId: string,
  expr: Expr,
  resolvedCommmands: Record<string, CommandExecuted>
):
  | { pendingCommands: CommandParsed[] }
  | { result: Value }
  | { error: string } {
  // If we have an terminal value:
  if (expr.type !== "call") {
    return { result: expr };
  }

  // See if its already resolved
  const maybeAlreadyResolved = resolvedCommmands[commandId];
  if (maybeAlreadyResolved != null) {
    if ("error" in maybeAlreadyResolved) {
      return {
        error:
          `the function '${maybeAlreadyResolved.name}' failed with error: ` +
          maybeAlreadyResolved.error,
      };
    }
    if (maybeAlreadyResolved.name != expr.name) {
      throw new Error(
        `corruption! expected resolved call to be ${expr.name} ` +
          `but got ${maybeAlreadyResolved.name}`
      );
    }
    const result = maybeAlreadyResolved.returnValue;
    return {
      result,
    };
  }

  // Build up a list of nested commands that must be resolved,
  // or if they are all resolved build up a list of resolved arguments.
  let pendingCommands: CommandParsed[] = [];
  let resolvedArguments: Value[] | null = [];
  for (const [i, arg] of Object.entries(expr.args)) {
    if (arg.type !== "call") {
      resolvedArguments?.push(arg);
      continue;
    }
    const argResult = getPendingCommandsOrResult(
      commandId + "." + i,
      arg,
      resolvedCommmands
    );
    if ("error" in argResult) {
      return argResult;
    }
    if ("pendingCommands" in argResult) {
      pendingCommands = [...pendingCommands, ...argResult.pendingCommands];
      // if at least 1 arg is still pending, then we don't have resolved arguments:
      resolvedArguments = null;
      continue;
    }
    resolvedArguments?.push(argResult.result);
  }

  // If all of the arguments are resolved then this call
  // becomes pending:
  if (resolvedArguments != null) {
    if (resolvedArguments.length !== expr.args.length) {
      throw new Error(
        `corruption! for ${expr.name} expected ${expr.args.length} ` +
          `arguments but got ${resolvedArguments.length}`
      );
    }
    return {
      pendingCommands: [
        {
          type: "parsed",
          args: resolvedArguments,
          id: commandId,
          name: expr.name,
        },
      ],
    };
  }

  // Otherwise we need to resolve the nested children first:
  return { pendingCommands };
}
