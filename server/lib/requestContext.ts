import * as t from "io-ts";

import {
  Value,
  StringValue,
  StringType,
  NumberType,
  BooleanType,
} from "@lib/valueTypes.ts";

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
    description: t.StringC;
  }>;
};

export const StringValueRequirement = t.type({
  type: StringType,
  description: t.string,
});
export type StringValueRequirement = t.TypeOf<typeof StringValueRequirement>;

export const NumberValueRequirement = t.type({ type: NumberType });
export type NumberValueRequirement = t.TypeOf<typeof NumberValueRequirement>;

export const BooleanValueRequirement = t.type({ type: BooleanType });
export type BooleanValueRequirement = t.TypeOf<typeof BooleanValueRequirement>;

export const ValueRequirement = t.union([
  StringValueRequirement,
  NumberValueRequirement,
  BooleanValueRequirement,
]);
export type ValueRequirement = t.TypeOf<typeof ValueRequirement>;

export const RequestContextRequirement = t.intersection([
  t.partial<KnownRequestContextDefProps>(
    Object.entries(KnownRequestContext.props).reduce(
      (a, [key, propDef]) => ({
        ...a,
        [key]: t.type({
          type: propDef.props.type,
          description: t.string,
        }),
      }),
      {} as Partial<KnownRequestContextDefProps>
    ) as KnownRequestContextDefProps
  ),
  t.record(t.string, ValueRequirement),
]);
export type RequestContextRequirement = t.TypeOf<
  typeof RequestContextRequirement
>;

export class RequestContextRequired extends Error {
  requirement: RequestContextRequirement;
  constructor(requirement: RequestContextRequirement) {
    super("request context required");
    this.requirement = requirement;
  }
}
