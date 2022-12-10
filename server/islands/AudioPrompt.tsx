import { IS_BROWSER } from "https://deno.land/x/fresh@1.1.2/runtime.ts";
import { useState, useEffect } from "preact/hooks";

export default function AudioPrompt(props: {}) {
  if (!IS_BROWSER) {
    return <div></div>;
  }

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
      const result = await fetch("/api/audio-request", {
        method: "POST",
        body: new Blob(buffers),
      });

      const resultBody = await result.text();
      setResult(resultBody);
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
      <p>Press to record</p>
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
        <pre>{result}</pre>
      </div>
    </div>
  );
}
