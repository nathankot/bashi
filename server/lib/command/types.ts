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

export const ArgumentType = ValueType;
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
    requestContext: RequestContext,
    args: { [K in keyof A]: ValueForType<A[K]> }
  ) => Promise<ValueForType<R>>;
};

export const CommandSet = t.record(t.string, CommandDefinition);
export type CommandSet = t.TypeOf<typeof CommandSet>;

export const CommandParsed = t.type({
  id: t.number,
  type: t.literal("parsed"),
  name: t.string,
  args: t.array(Argument),
});
export type CommandParsed = t.TypeOf<typeof CommandParsed>;

export const CommandExecuted = t.type({
  id: t.number,
  type: t.literal("executed"),
  name: t.string,
  args: t.array(Argument),
  returnValue: Value,
});
export type CommandExecuted = t.TypeOf<typeof CommandExecuted>;

export const Command = t.union([CommandParsed, CommandExecuted]);
export type Command = t.TypeOf<typeof Command>;

export const Commands = t.array(Command);
export type Commands = t.TypeOf<typeof Commands>;
