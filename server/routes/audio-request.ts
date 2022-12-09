import { HandlerContext } from "$fresh/server.ts";

import { Configuration, OpenAIApi } from "openai";

const PROMPT = (
  request: string
) => `You are a voice assistant capable of interpreting requests.

For each request respond with an acknowledgment and a structured interpretation if identified. A structured interpretation is composed of one or more components separated by newlines.

The available components are as follows, arguments are denoted by angle brackets and every argument is required:

- \`$calendar "<relative time>" "<event name>"\`: create a calendar event on a certain date with a certain name
- \`$reminder "<relative time>" "<reminder name>"\`: create a reminder on a certain date
- \`$email "<recipient>" "<subject>" "<contents>"\`: send an email
- \`$lights-off "<room name>"\`: turn lights off in the given room
- \`$lights-on "<room name>"\`: turn lights on in the given room
- \`$math "<formula>"\`: compute a math formula
- \`$call "<contact name>"\`: initiate a phone call to the given contact
- \`$weather "<location>"\`: check the weather in the given location
- \`$time "<location>"\`: check the time in the given location, omit location for the current location

For example, if the request is \`create event for lunch with Bob tomorrow\` respond with:

\`\`\`
Understood.
$calendar "tomorrow 12PM" "lunch with Bob"
\`\`\`

If no structured interpretation is found, answer the request if it is a question. Or ask for information that might be missing from the request. Or as a last resort, respond that the request is not supported. Keep your response concise.

The request is:

\`\`\`
${request}
\`\`\`

Write your response below:`;

export const handler = async (
  req: Request,
  _ctx: HandlerContext
): Promise<Response> => {
  const demoFile = Deno.readFileSync("./demo.m4a");

  let request = await req.text();

  if (request == null || request.length === 0) {
    const whisperRequest = new FormData();
    whisperRequest.append("audio_file", new Blob([demoFile]), "demo.m4a");
    const whisperResponse = await fetch(
      Deno.env.get("WHISPER_TRANSCRIBE_ENDPOINT") + "?language=en",
      {
        method: "POST",
        body: whisperRequest,
      }
    );
    const whisperBody = await whisperResponse.json();
    request = whisperBody.text;
  }

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: Deno.env.get("OPENAI_KEY"),
    })
  );

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    max_tokens: 500, // TODO return error if completion tokens has reached this limit
    best_of: 1,
    echo: false,
    prompt: [PROMPT(request)],
  });

  return new Response(request + `\n` + JSON.stringify(completion.data));
};
