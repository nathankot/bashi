import * as t from "io-ts";

import { JSONSchema7Definition } from "https://esm.sh/@types/json-schema";

import * as postSessions from "@routes/api/sessions.ts";
// import * aj postModelName from "@routes/api/session/requests/[modelName].ts";

export default async function generateSwaggerSpec() {
  console.log(JSON.stringify(toJSONSchema(postSessions.Response), null, "  "));
}

type SupportedTag =
  | "StringType"
  | "NumberType"
  | "BooleanType"
  | "ArrayType"
  | "KeyofType"
  | "IntersectionType"
  | "LiteralType"
  | "UnionType"
  | "DictionaryType"
  | "PartialType"
  | "InterfaceType";

function toJSONSchema(type: { _tag: SupportedTag }): JSONSchema7Definition {
  switch (type._tag) {
    case "StringType":
      return { type: "string" };
    case "NumberType":
      return { type: "number" };
    case "BooleanType":
      return { type: "boolean" };
    case "ArrayType":
      return { type: "array", items: toJSONSchema((type as any).type) };
    case "LiteralType":
      const lit = type as t.LiteralType<any>;
      return { const: lit.value };
    case "IntersectionType":
      const intersection = type as t.IntersectionType<any[]>;
      return {
        allOf: intersection.types.map((t) => toJSONSchema(t)),
      };
    case "UnionType":
      const union = type as t.UnionType<any[]>;
      return {
        allOf: union.types.map((t) => toJSONSchema(t)),
      };
    case "DictionaryType":
      const dict = type as t.DictionaryType<t.StringType, any>;
      return {
        type: "object",
        patternProperties: {
          "^.*$": toJSONSchema(dict.codomain),
        },
      };
    case "PartialType":
      const partial = type as t.PartialType<
        Record<string, { _tag: SupportedTag }>
      >;
      return {
        type: "object",
        additionalProperties: Object.entries(partial.props).reduce(
          (a, [p, t]) => ({
            ...a,
            [p]: toJSONSchema(
              // The typings for io-ts is a little weird, it seems that the
              // codomain types for partial() can be of the form { type: { _tag } }
              // rather than { _tag }
              !("_tag" in t) && (("type" in t) as any) ? (t as any).type : t
            ),
          }),
          {}
        ),
      };
    case "InterfaceType":
      const iface = type as t.InterfaceType<
        Record<string, { _tag: SupportedTag }>
      >;
      return {
        type: "object",
        properties: Object.entries(iface.props).reduce(
          (a, [p, t]) => ({ ...a, [p]: toJSONSchema(t) }),
          {}
        ),
      };
    case "KeyofType":
      const kof = type as t.KeyofType<{ [key: string]: unknown }>;
      return {
        oneOf: Object.keys(kof.keys).map((k) => ({
          const: k,
        })),
      };
    case undefined:
      if ("name" in type && type.name === "Date") {
        return {
          type: "string",
          format: "full-date",
        };
      }
      console.debug(type);
      throw new Error(`unsupported type`);
    default:
      const exhaustiveCheck: never = type._tag;
      console.debug(type);
      throw new Error(`unsupported type: ${exhaustiveCheck}`);
  }
}
