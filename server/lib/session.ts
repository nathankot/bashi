import * as t from "io-ts";
import { date } from "io-ts-types";

import { AssistDaVinci003ModelOptions } from "./models/assist_davinci_003.ts";

// In the future:
// t.union([AssistDaVinci003ModelOptions]),
export const ModelConfiguration = AssistDaVinci003ModelOptions;
export type ModelConfiguration = t.TypeOf<typeof ModelConfiguration>;

export const Session = t.intersection([
  t.type({
    sessionId: t.string,
    expiresAt: date,
  }),
  ModelConfiguration,
]);

export type Session = t.TypeOf<typeof Session>;
