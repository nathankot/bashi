import * as t from "io-ts";

import { DEFAULT_MAX_RESPONSE_TOKENS } from "@lib/constants.ts";
import builtinCommands from "@lib/command/builtinCommands.ts";
import { commandInterceptors } from "@lib/command/interceptors.ts";

export const KnownBuiltinCommand = t.keyof(builtinCommands);
export type KnownBuiltinCommand = t.TypeOf<typeof KnownBuiltinCommand>;

// We assume that any command with an interceptor is executed on the server.
// This list is useful as clients can by default enable all of these commands
// without worrying about implementing support.
export const ServerExecutedCommand = t.keyof(commandInterceptors);
export type ServerExecutedCommand = t.TypeOf<typeof ServerExecutedCommand>;

export const Configuration = t.type({
  locale: t.string,
  timezoneUtcOffset: t.number,
  maxResponseTokens: t.number,
  bestOf: t.number,
  enabledBuiltinCommands: t.array(KnownBuiltinCommand),
});
export type Configuration = t.TypeOf<typeof Configuration>;

const allBuiltinCommands = Object.keys(
  builtinCommands
) as (keyof typeof builtinCommands)[];

export const defaultConfiguration: Configuration = {
  locale: "en-US",
  maxResponseTokens: DEFAULT_MAX_RESPONSE_TOKENS,
  bestOf: 2,
  enabledBuiltinCommands: allBuiltinCommands,
  timezoneUtcOffset: 0,
};
