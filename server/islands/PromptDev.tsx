import { useState, useEffect } from "preact/hooks";

import { commandSet } from "@lib/fixtures.ts";
import { CommandSet } from "@lib/function/types.ts";
import { Session } from "@lib/session.ts";
import { POSTRequest as PostSessionRequest } from "@routes/api/sessions.ts";
import TextPrompt from "./TextPrompt.tsx";
import AudioPrompt from "./AudioPrompt.tsx";

export default function PromptDev() {
  const [error, setError] = useState<string | null>(null);
  const [commands, setCommands] = useState<CommandSet>(commandSet);
  const [sessionId, setSessionId] = useState<null | string>(null);

  useEffect(() => {
    let body: PostSessionRequest = {
      modelConfigurations: {
        "assist-000": {
          model: "assist-000",
          commands,
        },
      },
    };

    fetch("/api/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 0",
      },
      body: JSON.stringify(body),
    })
      .then((sessResp) => sessResp.json())
      .then((sessJson: { session: Session }) =>
        setSessionId(sessJson.session.sessionId)
      );
  }, [commands]);

  const onCommandsChange = (t: string) => {
    try {
      const decoded = CommandSet.decode(JSON.parse(t));
      if (decoded.right == null) {
        setError("could not decode commands");
        return;
      }
      setError(null);
      setCommands(decoded.right);
    } catch {
      setError("could not parse json");
    }
  };

  if (sessionId == null) {
    return <div>Loading session</div>;
  }

  return (
    <div>
      <div class="my-8">
        <h2 class="text-lg mb-2">Text prompt</h2>
        <TextPrompt sessionId={sessionId} />
      </div>

      <div class="my-8">
        <h2 class="text-lg mb-2">Audio prompt</h2>
        <AudioPrompt sessionId={sessionId} />
      </div>

      <hr />

      <div class="my-8">
        <h2 class="text-lg mb-2">Function configuration</h2>

        {error == null ? null : (
          <p class="bg-red-400 text-white my-2 p-2 rounded-sm">
            error: {error}
          </p>
        )}
        <textarea
          class="block w-full h-96 font-mono text-xs"
          onChange={(e) => onCommandsChange(e.currentTarget.value)}
        >
          {JSON.stringify(commands, undefined, "  ")}
        </textarea>
      </div>
    </div>
  );
}
