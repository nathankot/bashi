import { Handlers } from "$fresh/server.ts";
import { renderError, renderJSON } from "@/util.ts";
import * as t from "io-ts";
import * as f from "fp-ts";

// import { renderError } from "@/util.ts";

const PostSessionRequest = t.type({
  commands: t.array(
    t.type({
      name: t.string,
      description: t.string,
      args: t.array(
        t.type({
          name: t.string,
          type: t.keyof({
            string: null,
            number: null,
            boolean: null,
          }),
        })
      ),
    })
  ),
});

interface PostSessionResponse {
  sessionId: string;
}

export const handler: Handlers<PostSessionResponse> = {
  async POST(req, ctx) {
    // TODO validate api key, for now just require it in the header.

    let json;
    try {
      json = await req.json();
    } catch {
      return renderError(400, "could not parse json");
    }
    const decodeResult = PostSessionRequest.decode(json);
    if (f.either.isLeft(decodeResult)) {
      return renderError(400, "malformed request");
    }

    // DONT TRUST THE USER.

    const decoded = decodeResult.right;
    console.log(decoded);

    const sessionId = crypto.randomUUID();
    return renderJSON<PostSessionResponse>({
      sessionId,
    });
  },
};
