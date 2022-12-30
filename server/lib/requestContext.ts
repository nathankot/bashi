import * as t from "io-ts";

export const RequestContext = t.partial({
  text: t.string,
  language: t.string,
});
export type RequestContext = t.TypeOf<typeof RequestContext>;

type RequestContextDefProps = {
  [K in keyof Required<RequestContext>]: t.TypeC<{
    type: t.LiteralC<"string">;
  }>;
};

export const RequestContextDef = t.partial<RequestContextDefProps>(
  Object.entries(RequestContext.props).reduce(
    (a, [key, type]) => ({
      ...a,
      [key]: (() => {
        switch (type) {
          case t.string:
            return { type: t.literal("string") };
          // case t.boolean:
          //   return { type: t.literal("number") };
          // case t.boolean:
          //   return { type: t.literal("boolean") };
          // default:
          //   const _exhaustiveCheck: never = type;
          //   throw new Error(`unexpected type: ${_exhaustiveCheck}`);
        }
      })(),
    }),
    {} as RequestContextDefProps
  )
);
export type RequestContextDef = t.TypeOf<typeof RequestContextDef>;
