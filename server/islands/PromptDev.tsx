import { useState, useEffect } from "preact/hooks";

import { commandSet } from "@lib/fixtures.ts";
import { CommandSet } from "@lib/command/types.ts";
import { Session } from "@lib/session.ts";
import { POSTRequest } from "@routes/api/sessions_types.ts";
import TextPrompt from "./TextPrompt.tsx";
import AudioPrompt from "./AudioPrompt.tsx";

export default function PromptDev() {
  const [error, setError] = useState<string | null>(null);
  const [commands, setCommands] = useState<CommandSet>(commandSet);
  const [sessionId, setSessionId] = useState<null | string>(null);

  useEffect(() => {
    let body: POSTRequest = {
      configuration: {},
      modelConfigurations: {
        "assist-001": {
          model: "assist-001",
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
      if (!CommandSet.is(decoded)) {
        setError("could not decode commands");
        return;
      }
      setError(null);
      setCommands(decoded);
    } catch {
      setError("could not parse json");
    }
  };

  if (sessionId == null) {
    return <div>Loading session</div>;
  }

  const model = "assist-001" as const;

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
