import * as t from "io-ts";
import { date } from "io-ts-types";

export const CommandDefinition = t.type({
  name: t.string,
  description: t.string,
  args: t.array(
    t.type({
      name: t.string,
      type: t.keyof({
        string: null,
        number: null,
        boolean: null,
      }),
    })
  ),
});

export type CommandDefinition = t.TypeOf<typeof CommandDefinition>;

export const Session = t.type({
  sessionId: t.string,
  expiresAt: date,
  commands: t.array(CommandDefinition),
});

export type Session = t.TypeOf<typeof Session>;
