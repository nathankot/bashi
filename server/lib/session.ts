import * as t from "io-ts";
import { date } from "io-ts-types";

import { Configuration as ModelConfiguration } from "@lib/models.ts";

import {
  Commands,
  CommandExecuted,
  CommandParsed,
} from "@lib/command/types.ts";

import { RequestContext } from "@lib/requestContext.ts";
import { ActionGroup } from "@lib/command.ts";

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
    pendingAssist000Request: t.type({
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
    assist001State: t.type({
      request: t.string,
      requestContext: RequestContext,
      loopCount: t.number,
      resolvedActionGroups: t.array(
        t.intersection([
          ActionGroup,
          t.type({
            result: t.string,
          }),
        ])
      ),
      resolvedCommands: t.record(t.number, CommandExecuted),
      pending: t.union([
        t.null,
        t.type({
          actionGroup: ActionGroup,
          commands: t.array(CommandParsed),
        }),
      ]),
    }),
  }),
]);

export type Session = t.TypeOf<typeof Session>;

export { Configuration, defaultConfiguration };
