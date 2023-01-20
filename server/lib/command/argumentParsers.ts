import * as t from "io-ts";
import { parseDate } from "chrono";

import { StringValue } from "@lib/valueTypes.ts";

export type ArgumentParserContext = {
  now: Date;
  chronoParseDate: typeof parseDate;
  timezoneUtcOffset: number;
};

export const argumentParsers = {
  naturalLanguageDateTime: {
    inputType: "string" as const,
    outputType: "string" as const,
    fn: function (ctx: ArgumentParserContext, arg: string): null | StringValue {
      const d = ctx.chronoParseDate(arg, {
        instant: ctx.now,
        timezone: ctx.timezoneUtcOffset,
      });
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
