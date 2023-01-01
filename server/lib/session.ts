import * as t from "io-ts";
import { date } from "io-ts-types";

import {
  Configuration as ModelConfiguration,
  AllOutput as ModelOutput,
} from "@lib/models.ts";

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
    outputAwaitingContext: ModelOutput,
  }),
]);

export type Session = t.TypeOf<typeof Session>;

export { Configuration, defaultConfiguration };
