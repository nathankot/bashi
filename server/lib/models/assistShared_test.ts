import { assertSnapshot } from "std/testing/snapshot.ts";

import { CommandExecuted, parseExpression } from "@lib/command.ts";
import { getPendingCommandsOrResult } from "./assistShared.ts";

for (const test of [
  {
    description: "example A step 1",
    commandId: "0",
    call: parseExpression(`test(a(), b(123, c()))`),
    resolvedCommands: {},
  },
  {
    description: "example A step 2",
    commandId: "0",
    call: parseExpression(`test(a(), b(123, c()))`),
    resolvedCommands: {
      "0.0": {
        type: "executed",
        args: [],
        id: "0.0",
        name: "a",
        returnValue: { type: "number", value: 123 },
      },
      "0.1.1": {
        type: "executed",
        args: [],
        id: "0.1.1",
        name: "c",
        returnValue: { type: "string", value: "blah" },
      },
    } as Record<string, CommandExecuted>,
  },
  {
    description: "example A step 3",
    commandId: "0",
    call: parseExpression(`test(a(), b(123, c()))`),
    resolvedCommands: {
      "0.0": {
        type: "executed",
        args: [],
        id: "0.0",
        name: "a",
        returnValue: { type: "number", value: 123 },
      },
      "0.1": {
        type: "executed",
        args: [],
        id: "0.1",
        name: "b",
        returnValue: { type: "string", value: "ha" },
      },
    } as Record<string, CommandExecuted>,
  },
  {
    description: "example A step 4",
    commandId: "0",
    call: parseExpression(`test(a(), b(123, c()))`),
    resolvedCommands: {
      "0": {
        type: "executed",
        args: [],
        id: "0",
        name: "test",
        returnValue: { type: "number", value: 123 },
      },
    } as Record<string, CommandExecuted>,
  },
]) {
  Deno.test(test.description, async (t) => {
    try {
      await assertSnapshot(
        t,
        getPendingCommandsOrResult(
          test.commandId,
          test.call,
          test.resolvedCommands
        )
      );
    } catch (e) {
      await assertSnapshot(t, e.message);
    }
  });
}
