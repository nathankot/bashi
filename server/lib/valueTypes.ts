import * as t from "io-ts";

export const StringType = t.literal("string");
export type StringType = t.TypeOf<typeof StringType>;

export const NumberType = t.literal("number");
export type NumberType = t.TypeOf<typeof NumberType>;

export const BooleanType = t.literal("boolean");
export type BooleanType = t.TypeOf<typeof BooleanType>;

export const StringValue = t.type({ type: StringType, value: t.string });
export type StringValue = t.TypeOf<typeof StringValue>;

export const NumberValue = t.type({ type: NumberType, value: t.number });
export type NumberValue = t.TypeOf<typeof NumberValue>;

export const BooleanValue = t.type({ type: BooleanType, value: t.boolean });
export type BooleanValue = t.TypeOf<typeof BooleanValue>;

export const Value = t.union([StringValue, NumberValue, BooleanValue]);
export type Value = t.TypeOf<typeof Value>;

export const ValueTypes = t.union([StringType, NumberType, BooleanType]);
export type ValueType = t.TypeOf<typeof ValueTypes>;
