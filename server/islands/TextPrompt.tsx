import { useState } from "preact/hooks";
import { PostRequestsRequest } from "@routes/api/session/requests.ts";

export default function TextPrompt(props: { sessionId: string }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const submit = async () => {
    const request: PostRequestsRequest = {
      model: "assist-davinci-003",
      request: prompt,
    };
    const result = await fetch("/api/session/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${props.sessionId}`,
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
