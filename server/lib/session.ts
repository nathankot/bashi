import * as t from "io-ts";
import { date } from "io-ts-types";

import {
  AllConfiguration as ModelConfiguration,
  AllOutput as ModelOutput,
} from "@lib/models.ts";

import {
  Configuration,
  defaultConfiguration,
} from "@lib/session/configuration.ts";

export const Session = t.intersection([
  t.type({
    accountNumber: t.string,
    sessionId: t.string,
    expiresAt: date,
    configuration: Configuration,
    modelConfigurations: t.array(ModelConfiguration),
  }),
  t.partial({
    outputAwaitingContext: ModelOutput,
  }),
]);

export type Session = t.TypeOf<typeof Session>;

export { Configuration, defaultConfiguration };
