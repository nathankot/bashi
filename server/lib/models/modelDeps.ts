import { IPolicy } from "cockatiel";

import { LogFn } from "@lib/log.ts";
import { openai } from "@lib/clients.ts";
import { Session } from "@lib/session.ts";

export type ModelDeps = {
  openai: typeof openai;
  log: LogFn;
  whisperEndpoint: string;
  now: () => Date;
  session: Session;
  faultHandlingPolicy: IPolicy;
  signal: AbortSignal;
  setUpdatedSession: (session: Session) => void;
};