import * as t from "io-ts";

export type ArgumentParserContext = {
  now: Date;
  chronoParseDate: (str: string) => null | Date;
};

export const argumentParsers = {
  naturalLanguageDateTime: {
    inputType: "string" as "string",
    outputType: "string" as "string",
    fn: function (ctx: ArgumentParserContext, arg: string): null | string {
      const d = ctx.chronoParseDate(arg);
      if (d == null) {
        return null;
      }
      return d.toISOString();
    },
  },
};

export const ArgumentParser = t.keyof(argumentParsers);
export type ArgumentParser = t.TypeOf<typeof ArgumentParser>;

export const Argument = t.union([t.string, t.number, t.boolean]);
export type Argument = t.TypeOf<typeof Argument>;

export default argumentParsers;
