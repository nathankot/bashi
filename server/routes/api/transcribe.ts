import { Handlers } from "$fresh/server.ts";

import { renderError, renderJSON } from "@/util.ts";
import { whisper } from "@/clients.ts";

interface PostTranscribeResponse {
  text: string;
}

export const handler: Handlers<PostTranscribeResponse> = {
  async POST(req, ctx) {
    let audio = await req.arrayBuffer();
    if (audio == null) {
      return renderError(400, "no audio found in the request body");
    }
    const text = await whisper.transcribe(audio);
    return renderJSON<PostTranscribeResponse>({ text });
  },
};
