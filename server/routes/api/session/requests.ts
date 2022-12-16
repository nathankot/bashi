import { Handlers } from "$fresh/server.ts";

import { renderError, renderJSON } from "@lib/util.ts";

import { State as ApiState } from "@routes/api/_middleware.ts";
import { State } from "./_middleware.ts";

import Model, { Output } from "@lib/models/assist_davinci_003.ts";

export const handler: Handlers<Output, State & ApiState> = {
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
      const model = new Model(ctx.state.clients.openai, ctx.state.session);
      const result = model.run({
        model: "assist-davinci-003",
        request,
      });

      return renderJSON(result);
    } catch (e) {
      console.error("could not communicated with openai", e);
      return renderError(500, "internal server error");
    }
  },
};
