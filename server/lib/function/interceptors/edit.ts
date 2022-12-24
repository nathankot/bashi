import { interceptFunctionCall } from "./intercept_function_call.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptFunctionCall(
  "edit",
  async (modelDeps, input, [editingRequirement]) => {
    const text =
      input.requestContext == null ? null : input.requestContext["text"];
    if (text == null) {
      throw new Error("context text unexpectedly null");
    }
    if (typeof text !== "string") {
      throw new Error("context text should be a string");
    }
    const output = await run(modelDeps, "passthrough-openai-000", {
      model: "passthrough-openai-000",
      openAiModel: "text-davinci-003",
      request: `Rewrite and edit the following text. The requirement is '${editingRequirement}':

${text}`,
    });
    return output.result.trim();
  },
  async (ctx) => {
    if (typeof ctx["text"] !== "string" || (ctx["text"] ?? "").length === 0) {
      return {
        text: { type: "string" },
      };
    }
    return true;
  }
);

export default interceptor;
