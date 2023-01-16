import * as t from "io-ts";

import { DEFAULT_MAX_RESPONSE_TOKENS } from "@lib/constants.ts";
import builtinCommands from "@lib/command/builtinCommands.ts";

export const Configuration = t.type({
  locale: t.string,
  timezoneUtcOffset: t.number,
  maxResponseTokens: t.number,
  bestOf: t.number,
  enabledBuiltinCommands: t.array(t.keyof(builtinCommands)),
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
