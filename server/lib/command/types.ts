import * as t from "io-ts";

import { Value, ValueType, ValueForType } from "@lib/valueTypes.ts";
import { ModelDeps } from "@lib/models.ts";
import {
  RequestContextRequirement,
  RequestContext,
} from "@lib/requestContext.ts";

import { Argument, ArgumentParser } from "./argumentParsers.ts";

export { Argument, ArgumentParser };
export { Value as CommandReturnValue };

export const ArgumentType = t.keyof({
  string: null,
  number: null,
  boolean: null,
});
export type ArgumentType = t.TypeOf<typeof ArgumentType>;

export const CommandDefinition = t.intersection([
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
    returnType: ValueType,
  }),
  t.partial({
    triggerTokens: t.array(t.string),
  }),
]);
export type CommandDefinition = t.TypeOf<typeof CommandDefinition>;

export type BuiltinCommandDefinition<
  A extends ArgumentType[],
  R extends ValueType
> = Omit<CommandDefinition, "args" | "returnType"> & {
  returnType: R;
  args: {
    [K in keyof A]: {
      type: A[K];
      name: string;
    };
  };
  requestContextRequirement?: RequestContextRequirement;
  run: (
    deps: ModelDeps,
    input: RequestContext,
    args: BuiltinCommandDefinitionArgs<{
      [K in keyof A]: { type: A[K]; name: string };
    }>
  ) => Promise<ValueForType<R>>;
};

export type BuiltinCommandDefinitionArgs<A extends CommandDefinition["args"]> =
  {
    [K in keyof A]: Value & { type: A[K]["type"] };
  };

export const CommandSet = t.record(t.string, CommandDefinition);
export type CommandSet = t.TypeOf<typeof CommandSet>;

export const CommandParseError = t.type({
  type: t.literal("parse_error"),
  line: t.string,
  error: t.string,
});
export type CommandParseError = t.TypeOf<typeof CommandParseError>;

export const CommandInvalid = t.type({
  line: t.string,
  type: t.literal("invalid"),
  name: t.string,
  args: t.array(Argument),
  invalidReason: t.keyof({
    unknown_command: null,
    invalid_arguments: null,
    failed_execution: null,
  }),
});
export type CommandInvalid = t.TypeOf<typeof CommandInvalid>;

export const CommandParsed = t.intersection([
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
export type CommandParsed = t.TypeOf<typeof CommandParsed>;

export const CommandExecuted = t.type({
  line: t.string,
  type: t.literal("executed"),
  name: t.string,
  args: t.array(Argument),
  returnValues: t.array(Value),
});
export type CommandExecuted = t.TypeOf<typeof CommandExecuted>;

export const Command = t.union([
  CommandParseError,
  CommandInvalid,
  CommandParsed,
  CommandExecuted,
]);
export type Command = t.TypeOf<typeof Command>;

export const Commands = t.array(Command);
export type Commands = t.TypeOf<typeof Commands>;
