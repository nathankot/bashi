import * as t from "io-ts";

import { Value, ValueTypes, StringValue } from "@lib/valueTypes.ts";

const KnownRequestContext = t.partial({
  text: StringValue,
  language: StringValue,
});
type KnownRequestContext = t.TypeOf<typeof KnownRequestContext>;

export const RequestContext = t.intersection([
  KnownRequestContext,
  t.record(t.string, Value),
]);
export type RequestContext = t.TypeOf<typeof RequestContext>;

type KnownRequestContextDefProps = {
  [K in keyof Required<KnownRequestContext>]: t.TypeC<{
    type: t.LiteralC<Required<KnownRequestContext>[K]["type"]>;
  }>;
};

export const RequestContextDef = t.intersection([
  t.partial<KnownRequestContextDefProps>(
    Object.entries(KnownRequestContext.props).reduce(
      (a, [key, propDef]) =>
        ({
          ...a,
          [key]: t.type({ type: propDef.props.type }),
        } satisfies Partial<KnownRequestContextDefProps>),
      {} as Partial<KnownRequestContextDefProps>
    ) as KnownRequestContextDefProps
  ),
  t.record(t.string, t.type({ type: ValueTypes })),
]);
export type RequestContextDef = t.TypeOf<typeof RequestContextDef>;
