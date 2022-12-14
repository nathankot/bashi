import { Handlers } from "$fresh/server.ts";

import { State } from "@/routes/api/_middleware.ts";
import { renderError, renderJSON } from "@/util.ts";

interface PostTranscribeResponse {
  text: string;
}

export const handler: Handlers<PostTranscribeResponse, State> = {
  async POST(req, ctx) {
    let audio = await req.arrayBuffer();
    if (audio == null) {
      return renderError(400, "no audio found in the request body");
    }
    let text: string;
    try {
      text = await ctx.state.clients.whisper.transcribe(audio);
    } catch {
      return renderError(500, "unknown transcription error");
    }
    return renderJSON<PostTranscribeResponse>({ text });
  },
};
