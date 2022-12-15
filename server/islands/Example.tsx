import { useState, useEffect } from "preact/hooks";

import { FunctionList, Session, ModelConfiguration } from "@lib/types.ts";
import TextPrompt from "./TextPrompt.tsx";
import AudioPrompt from "./AudioPrompt.tsx";

const defaultFunctions: FunctionList = [
  {
    name: "calendar",
    description: `create a calendar event for some time relative to now`,
    args: [
      { name: "relative time", type: "string" },
      { name: "event name", type: "string" },
    ],
  },
  {
    name: "email",
    description: `send an email`,
    args: [
      { name: "recipient", type: "string" },
      { name: "subject", type: "string" },
      { name: "contents", type: "string" },
    ],
  },
  {
    name: "call",
    description: `initiate a phone call`,
    args: [{ name: "contact name", type: "string" }],
  },
  {
    name: "insert",
    description: `insert text into the current location`,
    args: [{ name: "text", type: "string" }],
  },
  {
    name: "reminder",
    description: `create a reminder on a certain date and time`,
    args: [
      { name: "relative time", type: "string" },
      { name: "reminder name", type: "string" },
    ],
  },
  {
    name: "math",
    description: `compute a math formula`,
    args: [{ name: "formula", type: "string" }],
  },
  {
    name: "weather",
    description: `check the weather in the given location`,
    args: [{ name: "location", type: "string" }],
  },
  {
    name: "time",
    description: `check the time in the given location`,
    args: [{ name: "location", type: "string" }],
  },
];

export default function Example() {
  const [error, setError] = useState<string | null>(null);
  const [functions, setFunctions] = useState<FunctionList>(defaultFunctions);
  const [sessionId, setSessionId] = useState<null | string>(null);

  useEffect(() => {
    let body: ModelConfiguration = {
      model: "assist-davinci-003",
      functions,
    };

    fetch("/api/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer fake-api-key",
      },
      body: JSON.stringify(body),
    })
      .then((sessResp) => sessResp.json())
      .then((sessJson: Session) => setSessionId(sessJson.sessionId));
  }, [functions]);

  const onFunctionsChange = (t: string) => {
    try {
      const decoded = FunctionList.decode(JSON.parse(t));
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
