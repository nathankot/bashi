import { useState, useEffect } from "preact/hooks";

import { Session } from "@lib/types.ts";
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

  /* - \`$calendar "<relative time>" "<event name>"\`: create a calendar event on a certain date with a certain name
   * - \`$reminder "<relative time>" "<reminder name>"\`: create a reminder on a certain date
   * - \`$email "<recipient>" "<subject>" "<contents>"\`: send an email
   * - \`$lights-off "<room name>"\`: turn lights off in the given room
   * - \`$lights-on "<room name>"\`: turn lights on in the given room
   * - \`$math "<formula>"\`: compute a math formula
   * - \`$call "<contact name>"\`: initiate a phone call to the given contact
   * - \`$weather "<location>"\`: check the weather in the given location
   * - \`$time "<location>"\`: check the time in the given location, omit location for the current location
   *  */
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
