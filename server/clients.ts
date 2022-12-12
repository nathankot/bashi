import * as r from "redis";
import { Configuration, OpenAIApi } from "openai";

import "https://deno.land/x/dotenv/load.ts";

const whisperEndpoint = Deno.env.get("WHISPER_TRANSCRIBE_ENDPOINT");
if (whisperEndpoint == null || whisperEndpoint.length === 0) {
  throw new Error("WHISPER_TRANSCRIBE_ENDPOINT must be declared");
}

export const redis = r.createClient({
  url: Deno.env.get("REDIS_URL"),
});

export const openai = new OpenAIApi(
  new Configuration({
    apiKey: Deno.env.get("OPENAI_KEY"),
  })
);

export const whisper = {
  async transcribe(audio: ArrayBuffer) {
    const whisperRequest = new FormData();
    whisperRequest.append("audio", new Blob([audio]));
    const whisperResponse = await fetch(whisperEndpoint + "?language=en", {
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

export async function setup() {
  console.log("connecting redis client");
  await redis.connect();
}

export async function gracefulStop() {
  console.log("disconnecting redis");
  const rc = await redis;
  await rc.quit();
  return;
}
