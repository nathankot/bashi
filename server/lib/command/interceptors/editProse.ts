import { interceptCommand } from "./interceptCommand.ts";
import { run } from "@lib/models.ts";

const interceptor = interceptCommand(
  "editProse",
  async (modelDeps, input, [editingRequirement]) => {
    const text = input.requestContext?.text?.value;
    if (text == null) {
      throw new Error("context text unexpectedly null");
    }
    const output = await run(modelDeps, "passthrough-openai-000", {
      openAiModel: "text-davinci-003",
      request: `Rewrite and edit the following text. The requirement is '${
        editingRequirement.value satisfies string
      }':

${text}`,
    });
    return [{ type: "string", value: output.result.trim() }];
  },
  async (ctx) => {
    if ((ctx.text?.value.length ?? 0) === 0) {
      return {
        text: { type: "string" },
      };
    }
    return true;
  }
);

export default interceptor;
