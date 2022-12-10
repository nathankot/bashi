import { HandlerContext } from "$fresh/server.ts";

import { Configuration, OpenAIApi } from "openai";

import PROMPT from "@/prompt.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext
): Promise<Response> => {
  let json = await req.json();
  if (json == null) {
    return new Response(JSON.stringify({ error: "could not parse json" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const request = json.request;

  if (request == null || typeof request !== "string") {
    return new Response(
      JSON.stringify({ error: "could not find request string" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

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
