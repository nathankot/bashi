import * as t from "io-ts";

export const StringType = t.literal("string");
export type StringType = t.TypeOf<typeof StringType>;

export const NumberType = t.literal("number");
export type NumberType = t.TypeOf<typeof NumberType>;

export const BooleanType = t.literal("boolean");
export type BooleanType = t.TypeOf<typeof BooleanType>;

export const NullType = t.literal("null");
export type NullType = t.TypeOf<typeof NullType>;

export const ValueType = t.union([
  StringType,
  NumberType,
  BooleanType,
  NullType,
]);
export type ValueType = t.TypeOf<typeof ValueType>;

export const StringValue = t.type({ type: StringType, value: t.string });
export type StringValue = t.TypeOf<typeof StringValue>;

export const NumberValue = t.type({ type: NumberType, value: t.number });
export type NumberValue = t.TypeOf<typeof NumberValue>;

export const BooleanValue = t.type({ type: BooleanType, value: t.boolean });
export type BooleanValue = t.TypeOf<typeof BooleanValue>;

export const NullValue = t.type({ type: NullType });
export type NullValue = t.TypeOf<typeof NullValue>;

export const Value = t.union([
  StringValue,
  NumberValue,
  BooleanValue,
  NullValue,
]);
export type Value = t.TypeOf<typeof Value>;

export type ValueForType<T extends ValueType> = Value & { type: T };
