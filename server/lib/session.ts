import * as t from "io-ts";
import { date } from "io-ts-types";

import { DEFAULT_MAX_RESPONSE_TOKENS } from "@lib/constants.ts";
import { Configuration } from "@lib/models.ts";

export const Session = t.type({
  sessionId: t.string,
  expiresAt: date,
  configuration: t.type({
    locale: t.string,
    maxResponseTokens: t.number,
  }),
  modelConfigurations: t.array(Configuration),
});

export type Session = t.TypeOf<typeof Session>;

export const defaultConfiguration: Session["configuration"] = {
  locale: "en-US",
  maxResponseTokens: DEFAULT_MAX_RESPONSE_TOKENS,
};
