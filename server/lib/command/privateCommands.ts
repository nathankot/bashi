import { BuiltinCommandDefinition } from "./types.ts";

const clarify: BuiltinCommandDefinition<["string"]> = {
  description:
    "ask more information necessary to interpret the request, " +
    "must not be used with other functions",
  args: [{ name: "question for missing information", type: "string" }],
};

export const privateCommands = {
  clarify,
};

export default privateCommands;
