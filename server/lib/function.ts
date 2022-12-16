import * as t from "io-ts";

export const FunctionDefinition = t.type({
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

export const FunctionSet = t.record(t.string, FunctionDefinition);
export type FunctionSet = t.TypeOf<typeof FunctionSet>;

export const FunctionCalls = t.array(
  t.type({
    name: t.string,
    args: t.array(t.union([t.string, t.number, t.boolean])),
  })
);
export type FunctionCalls = t.TypeOf<typeof FunctionCalls>;
