import * as t from "io-ts";

export const RequestContextValue = t.union([t.string, t.number, t.boolean]);
export type RequestContextValue = t.TypeOf<typeof RequestContextValue>;

export const RequestContext = t.union([
  t.type({}),
  t.record(t.string, RequestContextValue),
]);
export type RequestContext = t.TypeOf<typeof RequestContext>;

export const RequestContextValueType = t.keyof({
  string: null,
  number: null,
  boolean: null,
});
export type RequestContextValueType = t.TypeOf<typeof RequestContextValueType>;

export const RequestContextDef = t.union([
  t.type({}),
  t.record(t.string, t.type({ type: RequestContextValueType })),
]);
export type RequestContextDef = t.TypeOf<typeof RequestContextDef>;
