import * as t from "io-ts";

import { Argument, ArgumentParser } from "./argumentParsers.ts";
export { Argument, ArgumentParser };

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

export const FunctionReturnValue = t.union([
  StringValue,
  NumberValue,
  BooleanValue,
]);
export type FunctionReturnValue = t.TypeOf<typeof FunctionReturnValue>;

export const FunctionCallParseError = t.type({
  type: t.literal("parse_error"),
  line: t.string,
  error: t.string,
});
export type FunctionCallParseError = t.TypeOf<typeof FunctionCallParseError>;

export const FunctionCallInvalid = t.type({
  line: t.string,
  type: t.literal("invalid"),
  name: t.string,
  args: t.array(Argument),
  invalidReason: t.keyof({
    unknown_function: null,
    invalid_arguments: null,
    failed_execution: null,
  }),
});
export type FunctionCallInvalid = t.TypeOf<typeof FunctionCallInvalid>;

export const FunctionCallParsed = t.intersection([
  t.type({
    line: t.string,
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
]);
export type FunctionCallParsed = t.TypeOf<typeof FunctionCallParsed>;

export const FunctionCallExecuted = t.type({
  line: t.string,
  type: t.literal("executed"),
  name: t.string,
  args: t.array(Argument),
  returnValue: FunctionReturnValue,
});
export type FunctionCallExecuted = t.TypeOf<typeof FunctionCallExecuted>;

export const FunctionCall = t.union([
  FunctionCallParseError,
  FunctionCallInvalid,
  FunctionCallParsed,
  FunctionCallExecuted,
]);
export type FunctionCall = t.TypeOf<typeof FunctionCall>;

export const FunctionCalls = t.array(FunctionCall);
export type FunctionCalls = t.TypeOf<typeof FunctionCalls>;
