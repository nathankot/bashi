import { assertSnapshot } from "std/testing/snapshot.ts";
import { parseStatements } from "./parser.ts";

for (const expr of [
  `someFunction(); someOtherFunction(" aa() ; bbb()")`,
  `someFunction();\nsomeOtherFunction(" aa() ; bbb()")`,
  "someCall()",
  "someCall(\n123,\ntrue\n)",
  "   someCall()\n\n ",
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

  // newline delimiting
  `const a_aaa = someCall(123 + 44, "abc")\n a_aaa + 123`,
  `someFunction() \n someOtherFunction(" aa() \n bbb()")`,

  // template literals
  "someCall(``)",
  "someCall(`${``}`)",
  "someCall(`${someCall(`${123}`)}`)",
  "someCall(`${someCall(`${'abc{}' + \"}{}def\" + `g`}`)}`)",
  "someCall(`a string \\${not_interpolated()}`)",
  "someCall(`a string ${interpolated()}`)",
  'someCall(`a string ${"interpolated"}`)',
  "someCall(`a string ${`interpolated`}`)",
  'someCall(`a string ${`interpolated` + `${"hard"}`}`)',
  "someCall(`a string 123 ${interpolate(`{}`)} hello`)",
  "someCall(`a string 123 ${`hello`    } hello`)",
  "someCall(`a \\`string 123 ${`he\\`llo`}`)",

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
