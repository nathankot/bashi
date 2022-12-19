import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptFunctionCall(
  "translate",
  async ({ log, session, modelDeps }, [targetLanguage, request]) => {
    const output = await run(modelDeps, session, "translate-davinci-003", {
      model: "translate-davinci-003",
      request,
      targetLanguage,
    });
    return output.result.trim();
  }
);

export default interceptor;
