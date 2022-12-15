import * as t from "io-ts";

import { FunctionList } from "@lib/function.ts";

export const AssistDaVinci003Options = t.type({
  model: t.literal("assist-davinci-003"),
  functions: FunctionList,
});

export type AssistDaVinci003Options = t.TypeOf<typeof AssistDaVinci003Options>;

export default function run() {}
