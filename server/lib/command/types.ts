import * as t from "io-ts";

import { Value, ValueType, ValueForType } from "@lib/valueTypes.ts";
import { ModelDeps } from "@lib/models.ts";

export const Memory = t.type({
  topLevelResults: t.array(Value),
  variables: t.record(t.string, Value),
});
export type Memory = t.TypeOf<typeof Memory>;

export const CommandDefinition = t.intersection([
  t.type({
    description: t.string,
    args: t.array(
      t.type({
        name: t.string,
        type: ValueType,
      })
    ),
    returnType: ValueType,
  }),
  t.partial({
    triggerTokens: t.array(t.string),
    cost: t.number,
  }),
]);
export type CommandDefinition = t.TypeOf<typeof CommandDefinition>;

export type BuiltinCommandDefinition<
  A extends ValueType[],
  R extends ValueType | "mixed"
> = Omit<CommandDefinition, "args" | "returnType"> & {
  isBuiltin: true;
  returnType: R;
  disable?: boolean;
  args: {
    [K in keyof A]: {
      type: A[K];
      name: string;
    };
  };
  run: (
    deps: ModelDeps,
    args: { [K in keyof A]: ValueForType<A[K]> },
    memory: Memory
  ) => Promise<R extends "mixed" ? Value : ValueForType<Exclude<R, "mixed">>>;
};

export type AnyBuiltinCommandDefinition = Omit<
  CommandDefinition,
  "returnType"
> & {
  isBuiltin: true;
  returnType: ValueType | "mixed";
  run: (deps: ModelDeps, args: any, memory: Memory) => Promise<Value>;
};

export const CommandSet = t.record(t.string, CommandDefinition);
export type CommandSet = t.TypeOf<typeof CommandSet>;

export const CommandParsed = t.type({
  id: t.string,
  type: t.literal("parsed"),
  name: t.string,
  args: t.array(Value),
});
export type CommandParsed = t.TypeOf<typeof CommandParsed>;

export const CommandExecuted = t.intersection([
  t.type({
    id: t.string,
    type: t.literal("executed"),
    name: t.string,
    args: t.array(Value),
    returnValue: Value,
  }),
  t.partial({
    error: t.string, // takes precedence over returnValue
  }),
]);
export type CommandExecuted = t.TypeOf<typeof CommandExecuted>;

export const Command = t.union([CommandParsed, CommandExecuted]);
export type Command = t.TypeOf<typeof Command>;

export const Commands = t.array(Command);
export type Commands = t.TypeOf<typeof Commands>;
