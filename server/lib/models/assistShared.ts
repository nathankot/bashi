import * as t from "io-ts";

import {
  BuiltinCommandDefinition,
  AnyBuiltinCommandDefinition,
  Command,
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
          returnType: "void",
          run: async (_, [lhs, rhs], memory) => {
            memory.variables[lhs.value] = rhs;
            return { type: "void" };
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
