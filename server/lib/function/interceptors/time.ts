import { interceptFunctionCall } from "./intercept_function_call.ts";

const interceptor = interceptFunctionCall(
  "time",
  async ({ log, session, now }, input, [timeZone]) => {
    return {
      type: "string",
      value: now().toLocaleString(session.configuration.locale, {
        timeZone: timeZone.value,
      }),
    };
  }
);

export default interceptor;
