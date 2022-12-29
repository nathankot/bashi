import { useState, useEffect } from "preact/hooks";

import type { Example } from "@/dev/updateExampleRequests.ts";

export default function Examples() {
  const [examples, setExamples] = useState<Example[]>([]);

  useEffect(() => {
    fetch("/assist_examples.jsonl")
      .then((r) => r.text())
      .then((t) =>
        t
          .split("\n")
          .filter((v) => v !== "")
          .map((v) => JSON.parse(v))
      )
      .then(setExamples);
  }, []);

  return (
    <div>
      {examples.map((example) => (
        <div class="mb-3">
          <div>{example.prompt}</div>
          {example.functionCalls.map((f) => (
            <div class="whitespace-pre text-xs font-mono overflow-x-auto">
              {JSON.stringify(f, null, "  ")}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
