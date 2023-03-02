import { IS_BROWSER } from "$fresh/runtime.ts";
import { useState, useEffect } from "preact/hooks";

import type { Input } from "@lib/models/assist001.ts";

export default function AudioPrompt(props: {
  sessionId: string;
  model: "assist-002";
}) {
  if (!IS_BROWSER) {
    return <div></div>;
  }

  const model = props.model;
  const [mediaRecorder, setMediaRecorder] = useState<null | MediaRecorder>(
    null
  );
  const [status, setStatus] = useState<"recording" | "processing" | "inactive">(
    "inactive"
  );
  const [result, setResult] = useState("");

  useEffect(() => {
    if (mediaRecorder == null) {
      return;
    }

    let buffers: Blob[] = [];

    const onDataAvailable = async (event: BlobEvent) =>
      buffers.push(event.data);

    const onStart = () => setStatus("recording");

    const onStop = async () => {
      setStatus("processing");
      const transcribeResponse = await fetch(
        "/api/session/requests/whisper-000",
        {
          method: "POST",
          body: new Blob(buffers),
          headers: {
            Authorization: `Bearer 0`,
            "Content-Type": "application/json",
            "Session-ID": props.sessionId,
          },
        }
      );
      const transcribeResult = await transcribeResponse.json();
      const request: Input = {
        request: transcribeResult.transcribed,
      };
      const result = await fetch(`/api/session/requests/${model}`, {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
          Authorization: `Bearer 0`,
          "Content-Type": "application/json",
          "Session-ID": props.sessionId,
        },
      });

      const resultJson = await result.json();
      setResult(JSON.stringify(resultJson, undefined, " "));
      setStatus("inactive");
      buffers = [];
    };

    mediaRecorder.addEventListener("dataavailable", onDataAvailable);
    mediaRecorder.addEventListener("stop", onStop);
    mediaRecorder.addEventListener("start", onStart);

    return () => {
      mediaRecorder.removeEventListener("dataavailable", onDataAvailable);
      mediaRecorder.removeEventListener("stop", onStop);
      mediaRecorder.removeEventListener("start", onStart);
    };
  }, [mediaRecorder]);

  const record = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.start();
  };

  const stop = () => {
    mediaRecorder?.stop();
    setMediaRecorder(null);
  };

  return (
    <div>
      <button
        class="ring(2 black) rounded bg-red-500 text-white p-1"
        onClick={(e) => {
          e.preventDefault();
          if (status === "inactive") {
            record();
          } else if (status === "recording") {
            stop();
          }
        }}
      >
        {status === "inactive"
          ? "record"
          : status === "recording"
          ? "stop"
          : "processing"}
      </button>

      <div>
        <textarea readOnly class="block w-full h-96 font-mono text-xs">
          {result}
        </textarea>
      </div>
    </div>
  );
}
