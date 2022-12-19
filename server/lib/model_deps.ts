import { LogFn } from "@lib/log.ts";
import { openai } from "@lib/clients.ts";

export type ModelDeps = {
  openai: typeof openai;
  log: LogFn;
  whisperEndpoint: string;
};
