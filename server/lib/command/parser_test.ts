import { assertSnapshot } from "std/testing/snapshot.ts";
import { parseFunctionCall, parseActionGroup } from "./parser.ts";

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
      const result = parseFunctionCall(expr);
      assertSnapshot(t, result);
    } catch (e) {
      assertSnapshot(t, (e as Error).message);
    }
  });
}

for (const expr of [
  `Thought: I need to do something
Action: someFunction() | someOtherFunction()
Result: blah blah blah blah`,
  `Thought: I need to do something action: thought: hmmm
Action: someFunction() | someOtherFunction()
Result: blah blah blah blah`,
  `Thought: I need to do something
Action: someFunction() | someOtherFunction()`,
  `tHOUght: I need to do something
aCTion  :    someFunction() | someOtherFunction()`,
  `Thought: I need to do something Action: head fake

Action: someFunction() | someOtherFunction()
Result: blah blah blah blah`,

  // Invalid examples:

  `Thought no colon doesnt work\nAction hahaha`,
  `Action: action should not come first\nThought: ha`,
  `completely invalid`,
  ``,
]) {
  Deno.test(expr === "" ? "empty string" : expr, (t) => {
    try {
      const result = parseActionGroup(expr);
      assertSnapshot(t, result);
    } catch (e) {
      assertSnapshot(t, (e as Error).message);
    }
  });
}
