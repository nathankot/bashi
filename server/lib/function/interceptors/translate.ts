import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptFunctionCall(
  "translate",
  async (modelDeps, input, [targetLanguage, request]) => {
    const model: "translate-000" = "translate-000";
    const output = await run(modelDeps, model, {
      request: request.value,
      targetLanguage: targetLanguage.value,
    });
    return { type: "string", value: output.result.trim() };
  }
);

export default interceptor;
