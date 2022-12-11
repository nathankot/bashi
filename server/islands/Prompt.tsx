import { useState } from "preact/hooks";

export default function Prompt(props: {}) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const submit = async () => {
    const result = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: prompt }),
    });

    const resultBody = await result.text();
    console.log(resultBody);
    setResult(resultBody);
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
