import { LogFn } from "@lib/log.ts";
import { openai } from "@lib/clients.ts";

import { Session } from "@lib/session.ts";

export type ModelDeps = {
  openai: typeof openai;
  log: LogFn;
  whisperEndpoint: string;
  now: () => Date;
  session: Session;
};
