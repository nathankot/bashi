import * as t from "io-ts";
import { date } from "io-ts-types";

import { AssistDaVinci003ModelOptions } from "./models/assist_davinci_003.ts";

export const Session = t.intersection([
  t.type({
    sessionId: t.string,
    expiresAt: date,
  }),
  AssistDaVinci003ModelOptions,
  // In the future:
  // t.union([AssistDaVinci003ModelOptions]),
]);

export type Session = t.TypeOf<typeof Session>;
