import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptFunctionCall(
  "generateCode",
  async (modelDeps, [targetLanguage, whatIsBeingGenerated, request]) => {
    const output = await run(modelDeps, "code-davinci-003", {
      model: "code-davinci-003",
      request,
      whatIsBeingGenerated,
      targetLanguage,
    });
    return output.result.trim();
  }
);

export default interceptor;
