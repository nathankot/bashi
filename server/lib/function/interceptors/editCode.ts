import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptFunctionCall(
  "editCode",
  async (modelDeps, input, [language, editingRequirement]) => {
    const text = input.requestContext?.text;
    if (text == null) {
      throw new Error("context text unexpectedly null");
    }
    const output = await run(modelDeps, "passthrough-openai-000", {
      openAiModel: "text-davinci-003",
      request: `Edit or refactor the code below based on the given requirement.
Programming language is '${input.requestContext?.language ?? language}'.
The requirement is '${editingRequirement}':

${text}`,
    });
    return output.result.trim();
  },
  async (ctx) => {
    if ((ctx.text?.length ?? 0) === 0) {
      return {
        text: { type: "string" },
      };
    }
    return true;
  }
);

export default interceptor;
