import { assertSnapshot } from "std/testing/snapshot.ts";
import { parseStatements, parseActionGroup } from "./parser.ts";

for (const expr of [
  `someFunction(); someOtherFunction(" aa() ; bbb()")`,
  `someFunction();\nsomeOtherFunction(" aa() ; bbb()")`,
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
  `someCall("hi" + ("there" + ("is" + "nesting")))`,
  `someCall("a string " + concated("STRING + blah" + (b() + c()) + "$"))`,
  `123123`,
  `"hi there"`,
  `true; 123123; 'hi there'`,
  `assign = "123"`,
  `var a = someCall(123 + 44, "abc")`,
  `let a_aaa = someCall(123 + 44, "abc")`,
  `const a_aaa = someCall(123 + 44, "abc")`,
  `const a_aaa = someCall(123 + 44, "abc"); a_aaa + 123`,

  // malformed:
  `assign = `,
  `malformed("a"`,
  `someCall(-123.500)`,
  `someCall("hi" + ("there" + (("is + "bad" + "nesting")))`,
  `someCall(true, a(b(), 123), "hello")`,
  `someCall(true, a(b(), 123), "hello",)`,
  `someCall(true, a((), 123), "hello",)`,
  `someCall(true, a(true, 123), "hello",)`,
  `someCall(true, a(true(), 123), "hello",)`,
  `someCall(true, a(true(), 123()), "hello",)`,
  `someCall(true, a(true(), 123()), "hello"(),)`,
  "testing blah",
  "",
]) {
  Deno.test(
    "parseStatements: " + (expr === "" ? "empty string" : expr),
    (t) => {
      try {
        const result = parseStatements(expr);
        assertSnapshot(t, result);
      } catch (e) {
        assertSnapshot(t, (e as Error).message);
      }
    }
  );
}

for (const expr of [
  `Thought: I need to do something
  Action: someFunction(123, "str", true)
  Result: blah blah blah blah`,
  `Thought: I need to do something
  Action: someFunction(123, "str", true)
  Result:`,
  `Thought: I need to do something
  Action: someFunction(123, "str", true)
  Result: `,
  `Thought: I need to do something action: thought: hmmm
  Action: someFunction()  ; someOtherFunction(" aa() ; bbb()")
  Result: blah blah blah blah`,
  `Thought: I need to do something
  Action: someFunction(true); someOtherFunction(true, 123, 'str', "str2")`,
  `tHOUght: I need to do something
  aCTion  :    someFunction();; someOtherFunction()`,
  `Thought: I need to do something Action: head fake
  Action: someFunction(); someOtherFunction()
  Result: blah blah blah blah`,
  `Thought: I need to do something Action: head fake
  Action: someFunction();
   someOtherFunction("Result:")
Result: blah blah blah blah
123123`,
  `Thought: I need to get the current time in New York and create a calendar event 5 days from now\nAction: now() + ' ' + currentTimeForTimezone('America/New_York'); createCalendarEvent(parseRelativeTime('in 5 days'), 'Dinner with Wife');`,
  `Thought: I need to get the current time in New York and create a calendar event 5 days from now\nAction: "some string"; 123; currentTimeForTimezone('Pacific/Auckland')`,

  // Invalid examples:
  `Thought no colon doesnt work\nAction hahaha`,
  `Action: action should not come first\nThought: ha`,
  `completely invalid`,
  ``,
]) {
  Deno.test(
    "parseActionGroup: " + (expr === "" ? "empty string" : expr),
    (t) => {
      try {
        const result = parseActionGroup(expr);
        assertSnapshot(t, result);
      } catch (e) {
        assertSnapshot(t, (e as Error).message);
      }
    }
  );
}
