import * as t from "io-ts";

export const FunctionDefinition = t.type({
  name: t.string,
  description: t.string,
  args: t.array(
    t.type({
      name: t.string,
      type: t.keyof({
        string: null,
        number: null,
        boolean: null,
      }),
    })
  ),
});
export type FunctionDefinition = t.TypeOf<typeof FunctionDefinition>;

export const FunctionList = t.array(FunctionDefinition);
export type FunctionList = t.TypeOf<typeof FunctionList>;

export const FunctionCalls = t.array(
  t.type({
    name: t.string,
    args: t.array(t.union([t.string, t.number, t.boolean])),
  })
);
export type FunctionCalls = t.TypeOf<typeof FunctionCalls>;
