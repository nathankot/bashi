import * as t from "io-ts";
import { date } from "io-ts-types";

import { Configuration } from "./models.ts";

export const Session = t.type({
  sessionId: t.string,
  expiresAt: date,
  globalConfiguration: t.type({
    locale: t.string,
  }),
  modelConfigurations: t.array(Configuration),
});

export type Session = t.TypeOf<typeof Session>;

export const defaultGlobalConfiguration: Session["globalConfiguration"] = {
  locale: "en-US",
};
