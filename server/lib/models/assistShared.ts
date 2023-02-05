import * as t from "io-ts";

import { Command } from "@lib/command.ts";
import { Value } from "@lib/valueTypes.ts";

export const Input = t.partial({
  request: t.string,
  resolvedCommands: t.record(t.string, Value),
});
export type Input = t.TypeOf<typeof Input>;

export const ResultFinished = t.type({
  type: t.literal("finished"),
  results: t.array(Value),
});
export type ResultFinished = t.TypeOf<typeof ResultFinished>;

export const ResultPendingCommands = t.type({
  type: t.literal("pending_commands"),
  pendingCommands: t.array(Command),
  results: t.array(Value),
});
export type ResultPendingCommands = t.TypeOf<typeof ResultPendingCommands>;
