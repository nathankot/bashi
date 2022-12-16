import * as t from "io-ts";
import { date } from "io-ts-types";

import { Configuration } from "./models/all.ts";

export const Session = t.type({
  sessionId: t.string,
  expiresAt: date,
  modelConfigurations: t.array(Configuration),
});

export type Session = t.TypeOf<typeof Session>;
