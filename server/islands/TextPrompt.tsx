import { useState } from "preact/hooks";

export default function TextPrompt(props: { sessionId: string }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const submit = async () => {
    const result = await fetch("/api/session/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${props.sessionId}`,
      },
      body: JSON.stringify({ request: prompt }),
    });

    const resultJson = await result.json();
    setResult(JSON.stringify(resultJson, undefined, " "));
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          onInput={(e) => setPrompt(e.currentTarget.value)}
          placeholder="enter your request"
        >
          {prompt}
        </textarea>
        <input type="submit" value="submit" />
      </form>

      <pre>{result}</pre>
    </>
  );
}
