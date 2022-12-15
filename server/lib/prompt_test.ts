import { assertSnapshot } from "std/testing/snapshot.ts";

import { makeFunctionList } from "./prompt.ts";

Deno.test("makeFunctionList", (t) => {
  assertSnapshot(t, makeFunctionList([]));
  assertSnapshot(
    t,
    makeFunctionList([
      {
        name: "example_function",
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
