import { interceptCommand } from "./interceptCommand.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptCommand(
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
