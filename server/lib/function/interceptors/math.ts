import * as mathjs from "mathjs";

import { interceptFunctionCall } from "./intercept_function_call.ts";

const interceptor = interceptFunctionCall(
  "math",
  async ({ log, session }, input, [expr]) => {
    const result = mathjs.evaluate(expr);
    return { type: "string", value: `${result}` };
  }
);

export default interceptor;
