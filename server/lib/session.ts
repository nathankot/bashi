import * as t from "io-ts";
import { date } from "io-ts-types";

import { DEFAULT_MAX_RESPONSE_TOKENS } from "@lib/constants.ts";
import { Configuration as ModelConfiguration } from "@lib/models.ts";
import { Configuration } from "@lib/session/configuration.ts";

export const Session = t.type({
  sessionId: t.string,
  expiresAt: date,
  configuration: Configuration,
  modelConfigurations: t.array(ModelConfiguration),
});

export type Session = t.TypeOf<typeof Session>;

export const defaultConfiguration: Session["configuration"] = {
  locale: "en-US",
  maxResponseTokens: DEFAULT_MAX_RESPONSE_TOKENS,
  bestOf: 1,
};
