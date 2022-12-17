import * as t from "io-ts";

export const FunctionDefinition = t.type({
  description: t.string,
  args: t.array(
    t.type({
      name: t.string,
      type: t.keyof({
        string: null,
        number: null,
        boolean: null,
      }),
    })
  ),
});
export type FunctionDefinition = t.TypeOf<typeof FunctionDefinition>;

export const FunctionSet = t.record(t.string, FunctionDefinition);
export type FunctionSet = t.TypeOf<typeof FunctionSet>;

export const FunctionCallArgument = t.union([t.string, t.number, t.boolean]);
export type FunctionCallArgument = t.TypeOf<typeof FunctionCallArgument>;

export const ReturnValue = t.union([t.string, t.number, t.boolean]);
export type ReturnValue = t.TypeOf<typeof ReturnValue>;

export const FunctionCall = t.union([
  t.type({
    type: t.literal("parse_error"),
    line: t.string,
    error: t.string,
  }),
  t.type({
    type: t.literal("parsed_but_invalid"),
    name: t.string,
    args: t.array(FunctionCallArgument),
    invalid_reason: t.union([
      t.literal("unknown_function"),
      t.literal("invalid arguments"),
    ]),
  }),
  t.type({
    type: t.literal("parsed"),
    name: t.string,
    args: t.array(FunctionCallArgument),
  }),
  t.type({
    type: t.literal("parsed_and_executed"),
    name: t.string,
    args: t.array(FunctionCallArgument),
    returnValue: ReturnValue,
  }),
]);
export type FunctionCall = t.TypeOf<typeof FunctionCall>;

export const FunctionCalls = t.array(FunctionCall);
export type FunctionCalls = t.TypeOf<typeof FunctionCalls>;
