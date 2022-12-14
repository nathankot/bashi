import { Handlers } from "$fresh/server.ts";

import { renderError, renderJSON } from "@/util.ts";
import PROMPT from "@/prompt.ts";

import { State as ApiState } from "@/routes/api/_middleware.ts";
import { State } from "./_middleware.ts";

interface PostRequestResponse {
  text: string;
  commands: {
    name: string;
    args: (string | number | boolean)[];
  }[];
}

export const handler: Handlers<PostRequestResponse, State & ApiState> = {
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

    try {
      const completion = await ctx.state.clients.openai.createCompletion({
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
    } catch (e) {
      console.error("could not communicated with openai", e);
      return renderError(500, "internal server error");
    }
  },
};
