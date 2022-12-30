import { useState } from "preact/hooks";
import { POSTRequest } from "@routes/api/session/requests/[modelName].ts";

export default function TextPrompt(props: { sessionId: string }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const submit = async () => {
    const request: POSTRequest = {
      request: prompt,
    };
    const result = await fetch("/api/session/requests/assist-000", {
      method: "POST",
      headers: {
        Authorization: `Bearer 0000000000000000`,
        "Content-Type": "application/json",
        "Session-ID": props.sessionId,
      },
      body: JSON.stringify(request),
    });

    const resultJson = await result.json();
    setResult(JSON.stringify(resultJson, undefined, " "));
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          class="block w-full h-12 font-mono text-xs"
          onInput={(e) => setPrompt(e.currentTarget.value)}
          placeholder="enter your request"
        >
          {prompt}
        </textarea>
        <input type="submit" value="submit" />
      </form>

      <div>
        <textarea readOnly class="block w-full h-96 font-mono text-xs">
          {result}
        </textarea>
      </div>
    </div>
  );
}
