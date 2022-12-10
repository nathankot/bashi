import { IS_BROWSER } from "https://deno.land/x/fresh@1.1.2/runtime.ts";
import { useState, useEffect } from "preact/hooks";

export default function AudioPrompt(props: {}) {
  if (!IS_BROWSER) {
    return <div></div>;
  }

  const [mediaStream, setMediaStream] = useState<null | MediaStream>(null);
  const [mediaRecorder, setMediaRecorder] = useState<null | MediaRecorder>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    let buffers: Blob[] = [];

    const onDataAvailable = async (event: BlobEvent) => {
      console.log("got data", event.data);
      buffers.push(event.data);
    };
    const onStart = () => {
      setIsRecording(true);
    };
    const onStop = async () => {
      console.log("BUFFERS", buffers);
      const result = await fetch("/audio-request", {
        method: "POST",
        body: new Blob(buffers),
      });

      const resultBody = await result.text();
      setResult(resultBody);

      setIsRecording(false);
      buffers = [];
    };

    mediaRecorder?.addEventListener("dataavailable", onDataAvailable);
    mediaRecorder?.addEventListener("stop", onStop);
    mediaRecorder?.addEventListener("start", onStart);

    return () => {
      mediaRecorder?.removeEventListener("dataavailable", onDataAvailable);
      mediaRecorder?.removeEventListener("stop", onStop);
      mediaRecorder?.removeEventListener("start", onStart);
    };
  }, [mediaRecorder]);

  const record = () => mediaRecorder?.start();
  const stop = () => mediaRecorder?.stop();

  if (mediaStream == null) {
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then(setMediaStream);
    return <div>Waiting for access to audio device.</div>;
  }

  if (mediaRecorder == null) {
    setMediaRecorder(new MediaRecorder(mediaStream));
    return <div>Waiting for access to audio device.</div>;
  }

  return (
    <div>
      <p>Hold to record.</p>
      <button
        class="ring(2 black) rounded bg-red-500 text-white p-1"
        onClick={(e) => {
          console.log("mouse down");
          e.preventDefault();
          isRecording ? stop() : record();
        }}
      >
        {isRecording ? "stop" : "record"}
      </button>

      <div>
        <pre>{result}</pre>
      </div>
    </div>
  );
}
