import { useState, useEffect } from "preact/hooks";

import { Session } from "@/types.ts";
import TextPrompt from "./TextPrompt.tsx";
import AudioPrompt from "./AudioPrompt.tsx";

export default function Example() {
  const [sessionId, setSessionId] = useState<null | string>(null);
  useEffect(() => {
    fetch("/api/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer fake-api-key",
      },
      body: JSON.stringify({
        commands: [],
      } as Pick<Session, "commands">),
    })
      .then((sessResp) => sessResp.json())
      .then((sessJson: Session) => setSessionId(sessJson.sessionId));
  }, []);

  if (sessionId == null) {
    return <div>Loading session</div>;
  }

  return (
    <div>
      <TextPrompt sessionId={sessionId} />
      <AudioPrompt sessionId={sessionId} />
    </div>
  );
}
