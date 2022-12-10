import { HandlerContext } from "$fresh/server.ts";

import { Configuration, OpenAIApi } from "openai";

import PROMPT from "@/prompt.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext
): Promise<Response> => {
  const demoFile = Deno.readFileSync("./demo.m4a");

  let audio = await req.arrayBuffer();

  if (audio == null) {
    audio = demoFile;
  }

  const whisperRequest = new FormData();
  whisperRequest.append("audio_file", new Blob([audio]), "audio.m4a");
  const whisperResponse = await fetch(
    Deno.env.get("WHISPER_TRANSCRIBE_ENDPOINT") + "?language=en",
    {
      method: "POST",
      body: whisperRequest,
    }
  );
  const whisperBody = await whisperResponse.json();
  const request = whisperBody.text;

  // Remove open ai for now
  // TODO removeme
  return new Response(
    JSON.stringify({
      request,
    })
  );

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: Deno.env.get("OPENAI_KEY"),
    })
  );

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    max_tokens: 1000, // TODO return error if completion tokens has reached this limit
    best_of: 1,
    echo: false,
    prompt: [PROMPT(request)],
  });

  return new Response(
    JSON.stringify({
      request,
      completion: completion.data,
    })
  );
};
