import { assertEquals } from "std/testing/asserts.ts";
import { builtinCommands } from "./builtinCommands.ts";
import * as fixtures from "@lib/fixtures.ts";

Deno.test("timezones", async (t) => {
  const deps = {
    now: () => fixtures.now,
    session: {
      configuration: {
        timezoneName: "Asia/Tokyo",
      },
    },
  } as any;

  let result = await builtinCommands.now.run(deps, [], {
    variables: {},
    requestContext: {},
  });
  assertEquals(result.value, "2022-12-19T17:41:10+09:00");
  assertEquals(new Date(result.value).getTime(), fixtures.now.getTime());

  result = await builtinCommands.parseRelativeTime.run(
    deps,
    [
      {
        type: "string",
        value: "tomorrow noon",
      },
    ],
    { variables: {}, requestContext: {} }
  );
  assertEquals(result.value, "2022-12-20T12:00:00+09:00");
  new Date(result.value);

  result = await builtinCommands.currentTimeForTimezone.run(
    deps,
    [
      {
        type: "string",
        value: "Pacific/Auckland",
      },
    ],
    { variables: {}, requestContext: {} }
  );
  assertEquals(result.value, "2022-12-19T21:41:10+13:00");
  new Date(result.value);
});
