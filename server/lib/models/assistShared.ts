import * as t from "io-ts";

import {
  RequestContext,
  RequestContextRequirement,
} from "@lib/requestContext.ts";

import { Command, CommandExecuted } from "@lib/command.ts";

import { Value } from "@lib/valueTypes.ts";

export const Input = t.partial({
  request: t.string,
  requestContext: RequestContext,
  resolvedCommands: t.record(t.string, Value),
});
export type Input = t.TypeOf<typeof Input>;

export const ResultFinished = t.type({
  type: t.literal("finished"),
  resolvedCommands: t.record(t.string, CommandExecuted),
});
export type ResultFinished = t.TypeOf<typeof ResultFinished>;

export const ResultNeedsRequestContext = t.type({
  type: t.literal("needs_request_context"),
  missingRequestContext: RequestContextRequirement,
  resolvedCommands: t.record(t.string, CommandExecuted),
});
export type ResultNeedsRequestContext = t.TypeOf<
  typeof ResultNeedsRequestContext
>;

export const ResultPendingCommands = t.type({
  type: t.literal("pending_commands"),
  pendingCommands: t.array(Command),
  resolvedCommands: t.record(t.string, CommandExecuted),
});
export type ResultPendingCommands = t.TypeOf<typeof ResultPendingCommands>;
