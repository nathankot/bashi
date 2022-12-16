import { openai } from "./clients.ts";

export type ModelDeps = {
  openai: typeof openai;
};
