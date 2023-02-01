import { IPolicy } from "cockatiel";

import { LogFn } from "@lib/log.ts";
import { openai, googleSearch } from "@lib/clients.ts";
import { Session } from "@lib/session.ts";

export type ModelDeps = {
  openai: typeof openai;
  googleSearch: typeof googleSearch;
  log: LogFn;
  whisperEndpoint: string;
  now: () => Date;
  session: Session;
  faultHandlingPolicy: IPolicy;
  signal: AbortSignal;
  setUpdatedSession: (session: Session) => void;
};
