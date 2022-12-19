import * as t from "io-ts";
import { date } from "io-ts-types";

import { AllConfiguration as ModelConfiguration } from "@lib/models.ts";
import {
  Configuration,
  defaultConfiguration,
} from "@lib/session/configuration.ts";

export const Session = t.type({
  sessionId: t.string,
  expiresAt: date,
  configuration: Configuration,
  modelConfigurations: t.array(ModelConfiguration),
});

export type Session = t.TypeOf<typeof Session>;

export { defaultConfiguration };
