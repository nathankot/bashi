import * as t from "io-ts";

import { SessionPublic } from "@lib/session.ts";
import { CommandSet } from "@lib/command.ts";

export const POSTRequest = t.intersection([
  t.type({
    modelConfigurations: SessionPublic.props.modelConfigurations,
  }),
  t.partial({
    configuration: t.partial(SessionPublic.props.configuration.props),
  }),
]);
export type POSTRequest = t.TypeOf<typeof POSTRequest>;

export const POSTResponse = t.type({
  session: SessionPublic,
  builtinCommands: CommandSet,
});
export type POSTResponse = t.TypeOf<typeof POSTResponse>;
