import * as mathjs from "mathjs";

import { interceptFunctionCall } from "./intercept_function_call.ts";

const interceptor = interceptFunctionCall(
  "math",
  async ({ log, session }, [expr]) => {
    const result = mathjs.evaluate(expr);
    return `${result}`;
  }
);

export default interceptor;
