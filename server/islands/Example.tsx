import { useState, useEffect } from "preact/hooks";

import { FunctionSet } from "@lib/function/types.ts";
import { Session } from "@lib/session.ts";
import { Request as PostSessionRequest } from "@routes/api/sessions.ts";
import TextPrompt from "./TextPrompt.tsx";
import AudioPrompt from "./AudioPrompt.tsx";

const exampleFunctions: FunctionSet = {
  calendar: {
    description: `create a calendar event for some time relative to now`,
    args: [
      { name: "relative time", type: "string" },
      { name: "event name", type: "string" },
    ],
  },
  email: {
    description: `send an email`,
    args: [
      { name: "recipient", type: "string" },
      { name: "subject", type: "string" },
      { name: "contents", type: "string" },
    ],
  },
  call: {
    description: `initiate a phone call`,
    args: [{ name: "contact name", type: "string" }],
  },
  reminder: {
    description: `create a reminder on a certain date and time`,
    args: [
      { name: "relative time", type: "string" },
      { name: "reminder name", type: "string" },
    ],
  },
};

export default function Example() {
  const [error, setError] = useState<string | null>(null);
  const [functions, setFunctions] = useState<FunctionSet>(exampleFunctions);
  const [sessionId, setSessionId] = useState<null | string>(null);

  useEffect(() => {
    let body: PostSessionRequest = {
      modelConfigurations: [
        {
          model: "assist-davinci-003",
          functions,
        },
      ],
    };

    fetch("/api/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer fake-api-key",
      },
      body: JSON.stringify(body),
    })
      .then((sessResp) => sessResp.json())
      .then((sessJson: { session: Session }) =>
        setSessionId(sessJson.session.sessionId)
      );
  }, [functions]);

  const onFunctionsChange = (t: string) => {
    try {
      const decoded = FunctionSet.decode(JSON.parse(t));
      if (decoded.right == null) {
        setError("could not decode functions");
        return;
      }
      setError(null);
      setFunctions(decoded.right);
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
          onChange={(e) => onFunctionsChange(e.currentTarget.value)}
        >
          {JSON.stringify(functions, undefined, "  ")}
        </textarea>
      </div>
    </div>
  );
}
