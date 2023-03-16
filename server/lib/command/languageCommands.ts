import { ValueType, ValueForType } from "@lib/valueTypes.ts";
import {
  AnyBuiltinCommandDefinition,
  BuiltinCommandDefinition,
} from "./types.ts";

export const languageCommands = {
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
