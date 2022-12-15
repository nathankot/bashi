import * as t from "io-ts";

import { FunctionList } from "@lib/function.ts";

export const AssistDaVinci003ModelOptions = t.type({
  model: t.literal("assist-davinci-003"),
  functions: FunctionList,
});

export type AssistDaVinci003ModelOptions = t.TypeOf<
  typeof AssistDaVinci003ModelOptions
>;
