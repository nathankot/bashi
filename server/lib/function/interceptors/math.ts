import * as mathjs from "mathjs";

import { interceptCommand } from "./intercept_function_call.ts";

const interceptor = interceptCommand(
  "math",
  async ({ log, session }, input, [expr]) => {
    const result = mathjs.evaluate(expr.value);
    return { type: "string", value: `${result}` };
  }
);

export default interceptor;
