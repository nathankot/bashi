import { interceptFunctionCall } from "./intercept_function_call.ts";

const interceptor = interceptFunctionCall(
  "time",
  async (log, session, [timeZone]) => {
    return new Date().toLocaleString(session.configuration.locale, {
      timeZone,
    });
  }
);

export default interceptor;
