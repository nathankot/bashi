import { assertSnapshot } from "std/testing/snapshot.ts";

import { parseWordsFromRequest } from "./filter.ts";

for (const request of [
  "",
  "hello jsd1231!@#!)@!^%!^% there my name is nathan",
  "boo",
  "a",
  "this UPPER CASE should be lower cased",
  "whats the time in new york?",
]) {
  Deno.test(request === "" ? "<empty>" : request, (t) => {
    assertSnapshot(t, parseWordsFromRequest(request));
  });
}
