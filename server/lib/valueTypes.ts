import * as t from "io-ts";

export const StringType = t.literal("string");
export type StringType = t.TypeOf<typeof StringType>;

export const NumberType = t.literal("number");
export type NumberType = t.TypeOf<typeof NumberType>;

export const BooleanType = t.literal("boolean");
export type BooleanType = t.TypeOf<typeof BooleanType>;

export const VoidType = t.literal("void");
export type VoidType = t.TypeOf<typeof VoidType>;

export const ErrorType = t.literal("error");
export type ErrorType = t.TypeOf<typeof ErrorType>;

export const ValueType = t.union([
  StringType,
  NumberType,
  BooleanType,
  VoidType,
]);
export type ValueType = t.TypeOf<typeof ValueType>;

export const StringValue = t.type({ type: StringType, value: t.string });
export type StringValue = t.TypeOf<typeof StringValue>;

export const NumberValue = t.type({ type: NumberType, value: t.number });
export type NumberValue = t.TypeOf<typeof NumberValue>;

export const BooleanValue = t.type({ type: BooleanType, value: t.boolean });
export type BooleanValue = t.TypeOf<typeof BooleanValue>;

export const VoidValue = t.type({ type: VoidType });
export type VoidValue = t.TypeOf<typeof VoidValue>;

export const ErrorValue = t.type({ type: ErrorType, message: t.string });
export type ErrorValue = t.TypeOf<typeof ErrorValue>;

export const Value = t.union([
  StringValue,
  NumberValue,
  BooleanValue,
  VoidValue,
  ErrorValue,
]);
export type Value = t.TypeOf<typeof Value>;

export type ValueForType<T extends ValueType> = Value & { type: T };

export function valueToString(value: Value): string {
  switch (value.type) {
    case "error":
      return "error";
    case "void":
      return "void";
    case "boolean":
      return JSON.stringify(value.value);
    case "number":
      return JSON.stringify(value.value);
    case "string":
      return JSON.stringify(value.value);
    default:
      const exhaustiveCheck: never = value;
      throw new Error(
        `the value ${JSON.stringify(exhaustiveCheck)} is unknown`
      );
  }
}
