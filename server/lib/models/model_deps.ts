import { openai } from "@lib/clients.ts";

export type ModelDeps = {
  openai: typeof openai;
};
