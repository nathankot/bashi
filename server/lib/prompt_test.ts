import { assertSnapshot } from "std/testing/snapshot.ts";

import { makeCommandList } from "./prompt.ts";

Deno.test("makeCommandList", (t) => {
  assertSnapshot(t, makeCommandList([]));
  assertSnapshot(
    t,
    makeCommandList([
      {
        name: "example_command",
        description: "some example description",
        args: [
          { name: "arg1", type: "string" },
          { name: "arg2", type: "number" },
          { name: "arg3", type: "boolean" },
        ],
      },
      {
        name: "blah",
        description: "some example description",
        args: [],
      },
    ])
  );
});
