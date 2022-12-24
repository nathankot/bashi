import * as t from "io-ts";

import { ModelName, ModelDeps, models } from "@lib/models.ts";

export type ModelInterceptor<N extends ModelName> = (
  deps: ModelDeps,
  input: t.TypeOf<typeof models[N]["Input"]>,
  output: t.TypeOf<typeof models[N]["Output"]>
) => Promise<t.TypeOf<typeof models[N]["Output"]>>;
