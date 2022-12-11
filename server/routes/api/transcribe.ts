import { Handlers } from "$fresh/server.ts";

interface PostTranscribeResponse {
  text: string;
}

export const handler: Handlers<PostTranscribeResponse> = {
  async POST(req, ctx) {
    let audio = await req.arrayBuffer();
    if (audio == null) {
      return new Response(
        JSON.stringify({ error: "no audio found in the request body" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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
    const text = whisperBody.text;

    return ctx.render({ text });
  },
};
