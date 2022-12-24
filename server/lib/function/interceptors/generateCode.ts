import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptFunctionCall(
  "generateCode",
  async (modelDeps, [targetLanguage, whatIsBeingGenerated, request]) => {
    const model = "code-000" as const;
    const output = await run(modelDeps, model, {
      model,
      request,
      whatIsBeingGenerated,
      targetLanguage,
    });
    return output.result.trim();
  }
);

export default interceptor;
