import * as t from "io-ts";

import { ModelName, ModelDeps, models } from "@lib/models.ts";

export type ModelInterceptor<Supported extends ModelName> = <
  N extends Supported
>(
  _: N,
  deps: ModelDeps,
  input: t.TypeOf<typeof models[N]["Input"]>,
  output: t.TypeOf<typeof models[N]["Output"]>
) => Promise<t.TypeOf<typeof models[N]["Output"]>>;
