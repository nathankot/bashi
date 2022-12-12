import * as t from "io-ts";
import { date } from "io-ts-types";

export const Session = t.type({
  sessionId: t.string,
  expiresAt: date,
  commands: t.array(
    t.type({
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
    })
  ),
});

export type Session = t.TypeOf<typeof Session>;
