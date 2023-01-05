import * as mathjs from "mathjs";

import { interceptCommand } from "./interceptCommand.ts";

const interceptor = interceptCommand(
  "math",
  async ({ log, session }, input, [expr]) => {
    const result = mathjs.evaluate(expr.value);
    return { type: "string", value: `${result}` };
  }
);

export default interceptor;
