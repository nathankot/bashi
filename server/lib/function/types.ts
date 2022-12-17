import * as t from "io-ts";

export const FunctionDefinitionArgTypes = t.keyof({
  string: null,
  number: null,
  boolean: null,
});
export type FunctionDefinitionArgTypes = t.TypeOf<
  typeof FunctionDefinitionArgTypes
>;

export const FunctionDefinition = t.type({
  description: t.string,
  args: t.array(
    t.type({
      name: t.string,
      type: FunctionDefinitionArgTypes,
    })
  ),
});
export type FunctionDefinition = t.TypeOf<typeof FunctionDefinition>;

export type KnownFunctionDefinition<A extends FunctionDefinitionArgTypes[]> =
  Omit<FunctionDefinition, "args"> & {
    args: { [K in keyof A]: { type: A[K]; name: string } };
  };

export type KnownFunctionDefinitionArgs<A extends FunctionDefinition["args"]> =
  {
    [K in keyof A]: A[K]["type"] extends "string"
      ? string
      : A[K]["type"] extends "number"
      ? number
      : A[K]["type"] extends "boolean"
      ? boolean
      : never;
  };

export const FunctionSet = t.record(t.string, FunctionDefinition);
export type FunctionSet = t.TypeOf<typeof FunctionSet>;

export const FunctionCallArgument = t.union([t.string, t.number, t.boolean]);
export type FunctionCallArgument = t.TypeOf<typeof FunctionCallArgument>;

export const FunctionReturnValue = t.union([t.string, t.number, t.boolean]);
export type FunctionReturnValue = t.TypeOf<typeof FunctionReturnValue>;

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
    returnValue: FunctionReturnValue,
  }),
]);
export type FunctionCall = t.TypeOf<typeof FunctionCall>;

export const FunctionCalls = t.array(FunctionCall);
export type FunctionCalls = t.TypeOf<typeof FunctionCalls>;
