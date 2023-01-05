import * as t from "io-ts";

export const StringValue = t.type({
  type: t.literal("string"),
  value: t.string,
});
export type StringValue = t.TypeOf<typeof StringValue>;

export const NumberValue = t.type({
  type: t.literal("number"),
  value: t.number,
});
export type NumberValue = t.TypeOf<typeof NumberValue>;

export const BooleanValue = t.type({
  type: t.literal("boolean"),
  value: t.boolean,
});
export type BooleanValue = t.TypeOf<typeof BooleanValue>;

export const Value = t.union([StringValue, NumberValue, BooleanValue]);
export type Value = t.TypeOf<typeof Value>;
