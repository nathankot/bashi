import { Session } from "@lib/session.ts";
import { AllOutput, ModelDeps } from "@lib/models.ts";
import { LogFn } from "@lib/log.ts";

export type OutputInterceptor<O extends AllOutput> = (
  deps: {
    log: LogFn;
    session: Session;
    modelDeps: ModelDeps;
  },
  output: O
) => Promise<O>;
