import { evaluate } from "./parser.ts";

Deno.bench("evaluate", () => {
  evaluate(
    `someCall("a some reasonably long string 1 2 03 ,djfklsdj sd sldk", 111, false)`
  );
  return;
});
