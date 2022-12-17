import { assertSnapshot } from "std/testing/snapshot.ts";
import { evaluate } from "./parser.ts";

for (const expr of [
  "someCall()",
  "someCall('a', 111)",
  "someCall('a \\'ha\\'', 111)",
  "someCall(`a`, 111)",
  "someCall(`a \\`ha\\``, 111)",
  `someCall("a", 111)`,
  `someCall("a \\"ha\\"", 111)`,
  `someCall("a", 111,true)`,
  `someCall("a", 111, false)`,
  `someCall("a false true 123 b", 111, false)`,
  `someCall(-123)`,
  `some_call()`,
  `some-call()`,
  `SOMECALL()`,
  `malformed("a"`,
  `someCall(-123.500)`,
  "testing blah",
  "",
]) {
  Deno.test(expr === "" ? "empty string" : expr, (t) => {
    try {
      const result = evaluate(expr);
      assertSnapshot(t, result);
    } catch (e) {
      assertSnapshot(t, (e as Error).message);
    }
  });
}
