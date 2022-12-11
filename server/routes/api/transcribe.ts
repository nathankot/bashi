import { HandlerContext } from "$fresh/server.ts";

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
  const result = whisperBody.text;

  return new Response(
    JSON.stringify({
      result,
    })
  );
};
