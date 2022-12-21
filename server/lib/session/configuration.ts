import * as t from "io-ts";

import { DEFAULT_MAX_RESPONSE_TOKENS } from "@lib/constants.ts";
import builtinFunctions from "@lib/function/builtin_functions.ts";

export const Configuration = t.type({
  locale: t.string,
  maxResponseTokens: t.number,
  bestOf: t.number,
  disabledBuiltinFunctions: t.array(t.keyof(builtinFunctions)),
});

export type Configuration = t.TypeOf<typeof Configuration>;

export const defaultConfiguration: Configuration = {
  locale: "en-US",
  maxResponseTokens: DEFAULT_MAX_RESPONSE_TOKENS,
  bestOf: 2,
  disabledBuiltinFunctions: [],
};
