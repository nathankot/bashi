import { interceptFunctionCall } from "./intercept_function_call.ts";

const interceptor = interceptFunctionCall(
  "time",
  async ({ log, session, now }, [timeZone]) => {
    return now.toLocaleString(session.configuration.locale, {
      timeZone,
    });
  }
);

export default interceptor;
