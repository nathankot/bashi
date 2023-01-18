import * as t from "io-ts";
import { date } from "io-ts-types";

import { Configuration as ModelConfiguration } from "@lib/models.ts";

import { Commands } from "@lib/command/types.ts";
import { RequestContext } from "@lib/requestContext.ts";

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
    pendingAssistRequest: t.type({
      request: t.string,
      commands: Commands,
      requestContext: RequestContext,
      clarifications: t.array(
        t.type({
          question: t.string,
          answer: t.string,
        })
      ),
    }),
  }),
]);

export type Session = t.TypeOf<typeof Session>;

export { Configuration, defaultConfiguration };

export {
  ServerExecutedCommand,
  KnownBuiltinCommand,
} from "./session/configuration.ts";
