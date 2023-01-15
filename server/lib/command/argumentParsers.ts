import * as t from "io-ts";

import { StringValue } from "@lib/valueTypes.ts";
export { Value as Argument } from "@lib/valueTypes.ts";

export type ArgumentParserContext = {
  now: Date;
  chronoParseDate: (str: string, ref?: Date) => null | Date;
};

export const argumentParsers = {
  naturalLanguageDateTime: {
    inputType: "string" as const,
    outputType: "string" as const,
    fn: function (ctx: ArgumentParserContext, arg: string): null | StringValue {
      const d = ctx.chronoParseDate(arg, ctx.now);
      if (d == null) {
        return null;
      }
      return {
        type: "string",
        value: d.toISOString(),
      };
    },
  },
};

export const ArgumentParser = t.keyof(argumentParsers);
export type ArgumentParser = t.TypeOf<typeof ArgumentParser>;

export default argumentParsers;
