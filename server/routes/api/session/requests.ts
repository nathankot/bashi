import { Handlers } from "$fresh/server.ts";

import { openai } from "@/clients.ts";
import { renderError, renderJSON } from "@/util.ts";
import PROMPT from "@/prompt.ts";

import { State } from "./_middleware.ts";

interface PostRequestResponse {
  text: string;
  commands: {
    name: string;
    args: (string | number | boolean)[];
  }[];
}

export const handler: Handlers<PostRequestResponse, State> = {
  async POST(req, ctx) {
    let json;
    try {
      json = await req.json();
    } catch {
      return renderError(400, "could not parse json");
    }

    const request = json.request;

    if (request == null || typeof request !== "string") {
      return renderError(400, "could not find request string");
    }

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 1000, // TODO return error if completion tokens has reached this limit
      best_of: 1,
      echo: false,
      prompt: [PROMPT(request)],
    });

    return renderJSON<PostRequestResponse>({
      text: completion.data.choices[0]?.text ?? "",
      commands: [],
    });
  },
};
