import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

import { openai } from "@lib/clients.ts";

const interceptor = interceptFunctionCall(
  "translate",
  async (session, [targetLanguage, request]) => {
    const output = await run("translate-davinci-003", { openai }, session, {
      model: "translate-davinci-003",
      request,
      targetLanguage,
    });
    return output.result.trim();
  }
);

export default interceptor;
