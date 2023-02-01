import * as t from "io-ts";
import * as r from "redis";
import { Configuration, OpenAIApi } from "openai";

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

const GoogleSearchResponse = t.partial({
  items: t.array(
    t.type({
      title: t.string,
      link: t.string,
      snippet: t.string,
    })
  ),
});

export async function googleSearch(
  q: string,
  signal?: AbortSignal
): Promise<
  {
    link: string;
    title: string;
    snippet: string;
  }[]
> {
  const key = Deno.env.get("GOOGLE_SEARCH_API_KEY");
  const cx = Deno.env.get("GOOGLE_SEARCH_ENGINE_ID");
  if (key == null) {
    throw new Error(`GOOGLE_SEARCH_API_KEY is missing`);
  }
  if (cx == null) {
    throw new Error(`GOOGLE_SEARCH_ENGINE_ID is missing`);
  }
  const response = await fetch(
    "https://www.googleapis.com/customsearch/v1?" +
      new URLSearchParams({ key, cx, q, num: "5" }),
    { signal }
  );
  const json = await response.json();
  if (!GoogleSearchResponse.is(json)) {
    throw new Error("could not parse response from google search");
  }
  return (
    json.items?.map((r) => ({
      title: r.title ?? "<no title>",
      link: r.link ?? "<no link>",
      snippet: r.snippet ?? "<no snippet>",
    })) ?? []
  );
}
