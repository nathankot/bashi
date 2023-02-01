import * as r from "redis";
import { Configuration, OpenAIApi } from "openai";
import { google } from "google-apis";

import "dotenv/load.ts";

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

const customSearch = google.customsearch("v1");
export async function googleSearch(
  query: string,
  maxResults: number = 10
): Promise<
  {
    link: string;
    title: string;
    snippet: string;
  }[]
> {
  const result = await customSearch.cse.list({
    q: query,
  });
  return (
    result.data.items?.slice(0, maxResults).map((r) => ({
      title: r.title ?? "<no title>",
      link: r.link ?? "<no link>",
      snippet: r.snippet ?? "<no snippet>",
    })) ?? []
  );
}
