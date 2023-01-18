import * as t from "io-ts";
import { ModelName, models } from "@lib/models.ts";

// Models that support returning commands.
export type CommandSupportedModels = {
  [K in ModelName]: t.TypeOf<typeof models[K]["Output"]> extends {
    result: { type: string };
  }
    ? K
    : never;
}[ModelName];
