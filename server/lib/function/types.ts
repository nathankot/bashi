import * as t from "io-ts";

import { Argument, ArgumentParser } from "./argument_parsers.ts";
export { Argument, ArgumentParser };

export const ArgumentType = t.keyof({
  string: null,
  number: null,
  boolean: null,
});
export type ArgumentType = t.TypeOf<typeof ArgumentType>;

export const FunctionDefinition = t.intersection([
  t.type({
    description: t.string,
    args: t.array(
      t.intersection([
        t.type({
          name: t.string,
          type: ArgumentType,
        }),
        t.partial({
          parse: t.array(ArgumentParser),
        }),
      ])
    ),
  }),
  t.partial({
    triggerTokens: t.array(t.string),
  }),
]);
export type FunctionDefinition = t.TypeOf<typeof FunctionDefinition>;

export type BuiltinFunctionDefinition<A extends ArgumentType[]> = Omit<
  FunctionDefinition,
  "args"
> & {
  args: { [K in keyof A]: { type: A[K]; name: string } };
  mustNotBeDisabled?: boolean;
};

export type BuiltinFunctionDefinitionArgs<
  A extends FunctionDefinition["args"]
> = {
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

export const FunctionReturnValue = t.union([t.string, t.number, t.boolean]);
export type FunctionReturnValue = t.TypeOf<typeof FunctionReturnValue>;

export const FunctionCall = t.union([
  t.type({
    type: t.literal("parse_error"),
    line: t.string,
    error: t.string,
  }),
  t.type({
    type: t.literal("invalid"),
    name: t.string,
    args: t.array(Argument),
    invalid_reason: t.union([
      t.literal("unknown_function"),
      t.literal("invalid_arguments"),
      t.literal("failed_execution"),
    ]),
  }),
  t.intersection([
    t.type({
      type: t.literal("parsed"),
      name: t.string,
      args: t.array(Argument),
    }),
    t.partial({
      argsParsed: t.array(
        // this produces a partial record:
        t.union([t.partial({}), t.record(ArgumentParser, Argument)])
      ),
    }),
  ]),
  t.type({
    type: t.literal("executed"),
    name: t.string,
    args: t.array(Argument),
    returnValue: FunctionReturnValue,
  }),
]);
export type FunctionCall = t.TypeOf<typeof FunctionCall>;

export const FunctionCalls = t.array(FunctionCall);
export type FunctionCalls = t.TypeOf<typeof FunctionCalls>;
