import * as t from "io-ts";

import { Session } from "@lib/session.ts";
import * as assistDavinci003 from "./assist_davinci_003.ts";
import * as noop from "./noop.ts";

export const models = {
  "assist-davinci-003": assistDavinci003,
  noop: noop,
};

export type ModelName = assistDavinci003.Name | noop.Name;

export const Configuration = t.union([
  assistDavinci003.Configuration,
  noop.Configuration,
]);
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.union([assistDavinci003.Input, noop.Input]);
export type Input = t.TypeOf<typeof Input>;

export const Output = t.union([assistDavinci003.Output, noop.Output]);
export type Output = t.TypeOf<typeof Output>;

export function getConfiguration<N extends keyof typeof models>(
  modelName: N,
  session: Session
): null | t.TypeOf<typeof models[N]["Configuration"]> {
  for (const conf of session.modelConfigurations) {
    if (conf.model === modelName) {
      return conf as unknown as t.TypeOf<typeof models[N]["Configuration"]>;
    }
  }
  return null;
}
