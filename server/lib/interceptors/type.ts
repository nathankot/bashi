import { AllOutput, ModelDeps } from "@lib/models.ts";

export type OutputInterceptor<O extends AllOutput> = (
  deps: ModelDeps,
  output: O
) => Promise<O>;
