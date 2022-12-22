import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptFunctionCall(
  "translate",
  async (modelDeps, [targetLanguage, request]) => {
    const output = await run(modelDeps, "translate-000", {
      model: "translate-000",
      request,
      targetLanguage,
    });
    return output.result.trim();
  }
);

export default interceptor;
