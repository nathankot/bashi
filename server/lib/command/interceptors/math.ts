import * as mathjs from "mathjs";

import { interceptCommand } from "./interceptCommand.ts";

const interceptor = interceptCommand(
  "math",
  async ({ log, session }, input, [expr]) => {
    try {
      const result = mathjs.evaluate(expr.value);
      return [{ type: "string", value: `${result satisfies string}` }];
    } catch {
      log("info", "failed to parse math: " + expr.value);
      return null;
    }
  }
);

export default interceptor;
