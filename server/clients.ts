import { createClient, RedisClientType } from "redis";
import { Configuration, OpenAIApi } from "openai";

import "https://deno.land/x/dotenv/load.ts";

export const redis = new Promise<RedisClientType>(async (resolve) => {
  const c = createClient({
    url: Deno.env.get("REDIS_URL"),
  });
  await c.connect();
  return c;
});

export const openai = Promise.resolve(
  new OpenAIApi(
    new Configuration({
      apiKey: Deno.env.get("OPENAI_KEY"),
    })
  )
);

export const whisper = Promise.resolve(
  (() => {
    const endpoint = Deno.env.get("WHISPER_TRANSCRIBE_ENDPOINT");
    if (endpoint == null || endpoint.length === 0) {
      throw new Error("WHISPER_TRANSCRIBE_ENDPOINT must be declared");
    }
    return {
      async transcribe(audio: ArrayBuffer) {
        const whisperRequest = new FormData();
        whisperRequest.append("audio", new Blob([audio]));
        const whisperResponse = await fetch(endpoint + "?language=en", {
          method: "POST",
          body: whisperRequest,
        });
        const whisperBody = await whisperResponse.json();
        const text = whisperBody.text;
        if (typeof text !== "string") {
          throw new Error("expected whisper response body to be string");
        }
        return text;
      },
    };
  })()
);

export async function gracefulStop() {
  const rc = await redis;
  await rc.quit();
}
