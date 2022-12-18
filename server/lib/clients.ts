import * as r from "redis";
import { Configuration, OpenAIApi } from "openai";

import "https://deno.land/x/dotenv/load.ts";

import { LogFn } from "@lib/log.ts";

const whisperEndpoint = Deno.env.get("WHISPER_TRANSCRIBE_ENDPOINT");
if (whisperEndpoint == null || whisperEndpoint.length === 0) {
  throw new Error("WHISPER_TRANSCRIBE_ENDPOINT must be declared");
}

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

export const whisper = {
  async transcribe(log: LogFn, audio: ArrayBuffer) {
    const whisperRequest = new FormData();
    whisperRequest.append("audio_file", new Blob([audio]), "audio_file");
    const whisperResponse = await fetch(whisperEndpoint + "?language=en", {
      method: "POST",
      body: whisperRequest,
    });
    const whisperBody = await whisperResponse.json();
    const text = whisperBody.text;
    if (typeof text !== "string") {
      log("error", {
        ...whisperBody,
        message: "failed to transcribe",
      });
      throw new Error("expected whisper response body to be string");
    }
    return text;
  },
};
