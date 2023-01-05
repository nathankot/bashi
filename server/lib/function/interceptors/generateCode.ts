import { interceptCommand } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptCommand(
  "generateCode",
  async (modelDeps, input, [targetLanguage, whatIsBeingGenerated, request]) => {
    const model = "code-000" as const;
    const output = await run(modelDeps, model, {
      request: request.value,
      whatIsBeingGenerated: whatIsBeingGenerated.value,
      targetLanguage: targetLanguage.value,
    });
    return { type: "string", value: output.result.trim() };
  }
);

export default interceptor;
