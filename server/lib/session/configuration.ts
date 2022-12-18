import * as t from "io-ts";

export const Configuration = t.type({
  locale: t.string,
  maxResponseTokens: t.number,
});

export type Configuration = t.TypeOf<typeof Configuration>;
