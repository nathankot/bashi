import { Handlers } from "$fresh/server.ts";

import { State } from "@routes/api/_middleware.ts";
import { handleError, renderJSON, renderError } from "@lib/util.ts";

interface PostTranscriptionsResponse {
  text: string;
}

export const handler: Handlers<PostTranscriptionsResponse, State> = {
  async POST(req, ctx) {
    let audio = await req.arrayBuffer();
    if (audio == null) {
      return renderError(400, "no audio found in the request body");
    }
    let text: string;
    try {
      text = await ctx.state.clients.whisper.transcribe(ctx.state.log, audio);
    } catch (e) {
      ctx.state.log("error", e);
      return handleError(e);
    }
    return renderJSON<PostTranscriptionsResponse>({ text });
  },
};
