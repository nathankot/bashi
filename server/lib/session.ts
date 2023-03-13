import * as t from "io-ts";
import { date } from "io-ts-types";

import { Configuration as ModelConfiguration, models } from "@lib/models.ts";

import {
  Configuration,
  defaultConfiguration,
} from "@lib/session/configuration.ts";

export const SessionPublic = t.type({
  accountNumber: t.string,
  sessionId: t.string,
  expiresAt: date,
  configuration: Configuration,
  modelConfigurations: ModelConfiguration,
});
export type SessionPublic = t.TypeOf<typeof SessionPublic>;

export const Session = t.intersection([
  SessionPublic,
  t.partial({
    assist001State: models["assist-001"].State,
    assist002State: models["assist-002"].State,
  }),
]);

export type Session = t.TypeOf<typeof Session>;

export { Configuration, defaultConfiguration };
