import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

import { openai } from "@lib/clients.ts";

const interceptor = interceptFunctionCall(
  "translate",
  async (log, session, [targetLanguage, request]) => {
    const output = await run(
      { openai, log },
      session,
      "translate-davinci-003",
      {
        model: "translate-davinci-003",
        request,
        targetLanguage,
      }
    );
    return output.result.trim();
  }
);

export default interceptor;
