import * as t from "io-ts";

import { ModelDeps } from "./model_deps.ts";

export const Name = t.literal("noop");
export type Name = t.TypeOf<typeof Name>;
export const Configuration = t.type({ model: t.literal("noop") });
export type Configuration = t.TypeOf<typeof Configuration>;
export const Input = t.type({ model: t.literal("noop") });
export type Input = t.TypeOf<typeof Input>;
export const Output = t.type({ model: t.literal("noop") });
export type Output = t.TypeOf<typeof Output>;

export const defaultConfiguration: Partial<Configuration> = {
  model: "noop",
};

export async function run(
  deps: ModelDeps,
  configuration: Configuration,
  input: Input
): Promise<Output> {
  return {
    model: "noop",
  };
}
