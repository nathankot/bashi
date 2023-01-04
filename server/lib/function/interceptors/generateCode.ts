import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptFunctionCall(
  "generateCode",
  async (modelDeps, input, [targetLanguage, whatIsBeingGenerated, request]) => {
    const model = "code-000" as const;
    const output = await run(modelDeps, model, {
      request,
      whatIsBeingGenerated,
      targetLanguage,
    });
    return { type: "string", value: output.result.trim() };
  }
);

export default interceptor;
