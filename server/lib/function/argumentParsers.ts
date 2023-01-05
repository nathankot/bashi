import * as t from "io-ts";

export { Value as Argument } from "./valueTypes.ts";

export type ArgumentParserContext = {
  now: Date;
  chronoParseDate: (str: string, ref?: Date) => null | Date;
};

export const argumentParsers = {
  naturalLanguageDateTime: {
    inputType: "string" as const,
    outputType: "string" as const,
    fn: function (ctx: ArgumentParserContext, arg: string): null | string {
      const d = ctx.chronoParseDate(arg, ctx.now);
      if (d == null) {
        return null;
      }
      return d.toISOString();
    },
  },
};

export const ArgumentParser = t.keyof(argumentParsers);
export type ArgumentParser = t.TypeOf<typeof ArgumentParser>;

export default argumentParsers;
