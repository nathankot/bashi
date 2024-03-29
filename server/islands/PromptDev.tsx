import { useState, useEffect } from "preact/hooks";

import { assist002CommandSet } from "@lib/fixtures.ts";
import TextPrompt from "./TextPrompt.tsx";
import AudioPrompt from "./AudioPrompt.tsx";

import type { CommandSet } from "@lib/command/types.ts";
import type { Session } from "@lib/session.ts";
import type { POSTRequest } from "@routes/api/sessions.ts";

export default function PromptDev() {
  const [error, setError] = useState<string | null>(null);
  const [commands, setCommands] = useState<CommandSet>(assist002CommandSet);
  const [sessionId, setSessionId] = useState<null | string>(null);

  useEffect(() => {
    let body: POSTRequest = {
      configuration: {},
      modelConfigurations: {
        "assist-002": {
          model: "assist-002",
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
      const decoded = JSON.parse(t);
      setError(null);
      setCommands(decoded);
    } catch {
      setError("could not parse json");
    }
  };

  if (sessionId == null) {
    return <div>Loading session</div>;
  }

  const model = "assist-002" as const;

  return (
    <div>
      <div class="my-8">
        <h2 class="text-lg mb-2">Text prompt</h2>
        <TextPrompt sessionId={sessionId} model={model} />
      </div>

      <div class="my-8">
        <h2 class="text-lg mb-2">Audio prompt</h2>
        <AudioPrompt sessionId={sessionId} model={model} />
      </div>

      <hr />

      <div class="my-8">
        <h2 class="text-lg mb-2">Command configuration</h2>

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
