import * as r from "redis";
import { Configuration, OpenAIApi } from "openai";

import "https://deno.land/x/dotenv/load.ts";

const redisUrl = Deno.env.get("REDIS_URL");
if (redisUrl == null || redisUrl.length === 0) {
  throw new Error("REDIS_URL must be declared");
}

export async function withRedis<T>(
  f: (client: ReturnType<typeof r.createClient>) => Promise<T>
): Promise<T> {
  const client = r.createClient({
    url: Deno.env.get("REDIS_URL"),
  });

  let result: T;
  await client.connect();
  try {
    result = await f(client);
  } finally {
    await client.disconnect();
  }

  return result;
}

export const openai = new OpenAIApi(
  new Configuration({
    apiKey: Deno.env.get("OPENAI_KEY"),
  })
);

const whisperEndpoint = Deno.env.get("WHISPER_TRANSCRIBE_ENDPOINT")!;
if (whisperEndpoint == null || whisperEndpoint.length === 0) {
  throw new Error("WHISPER_TRANSCRIBE_ENDPOINT must be declared");
}

export { whisperEndpoint };
