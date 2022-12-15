import * as t from "io-ts";
import { date } from "io-ts-types";

export const FunctionDefinition = t.type({
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

export type FunctionDefinition = t.TypeOf<typeof FunctionDefinition>;

export const FunctionList = t.array(FunctionDefinition);

export type FunctionList = t.TypeOf<typeof FunctionList>;

export const Session = t.type({
  sessionId: t.string,
  expiresAt: date,
  functions: FunctionList,
});

export type Session = t.TypeOf<typeof Session>;
