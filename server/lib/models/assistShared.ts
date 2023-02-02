import * as t from "io-ts";

import {
  RequestContext,
  RequestContextRequirement,
} from "@lib/requestContext.ts";

import { Command } from "@lib/command.ts";
import { Value } from "@lib/valueTypes.ts";

export const Input = t.partial({
  request: t.string,
  requestContext: RequestContext,
  resolvedCommands: t.record(t.string, Value),
});
export type Input = t.TypeOf<typeof Input>;

export const ResultFinished = t.type({
  type: t.literal("finished"),
  results: t.array(Value),
});
export type ResultFinished = t.TypeOf<typeof ResultFinished>;

export const ResultNeedsRequestContext = t.type({
  type: t.literal("needs_request_context"),
  missingRequestContext: RequestContextRequirement,
  results: t.array(Value),
});
export type ResultNeedsRequestContext = t.TypeOf<
  typeof ResultNeedsRequestContext
>;

export const ResultPendingCommands = t.type({
  type: t.literal("pending_commands"),
  pendingCommands: t.array(Command),
  results: t.array(Value),
});
export type ResultPendingCommands = t.TypeOf<typeof ResultPendingCommands>;
