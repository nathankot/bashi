import * as t from "io-ts";

import { equal } from "std/testing/asserts.ts";
import { JSONSchema7Definition } from "https://esm.sh/@types/json-schema";

type SupportedTag =
  | "AnyType"
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

export type { JSONSchema7Definition };

export default function toJSONSchema(
  type: {
    _tag: SupportedTag;
  },
  refs: Record<string, JSONSchema7Definition> = {}
): JSONSchema7Definition {
  const recurse = (type: { _tag: SupportedTag }): JSONSchema7Definition =>
    toJSONSchema(type, refs);

  const result: JSONSchema7Definition = (() => {
    switch (type._tag) {
      case "AnyType":
        return {};
      case "StringType":
        return { type: "string" };
      case "NumberType":
        return { type: "number" };
      case "BooleanType":
        return { type: "boolean" };
      case "ArrayType":
        return { type: "array", items: recurse((type as any).type) };
      case "LiteralType":
        const lit = type as t.LiteralType<any>;
        return { const: lit.value };
      case "IntersectionType":
        const intersection = type as t.IntersectionType<any[]>;
        return {
          allOf: intersection.types.map((t) => recurse(t)),
        };
      case "UnionType":
        const union = type as t.UnionType<any[]>;
        return {
          anyOf: union.types.map((t) => recurse(t)),
        };
      case "DictionaryType":
        const dict = type as t.DictionaryType<t.StringType, any>;
        return {
          type: "object",
          patternProperties: {
            "^.*$": recurse(dict.codomain),
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
              [p]: recurse(
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
            (a, [p, t]) => ({ ...a, [p]: recurse(t) }),
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
  })();

  let found: { ref: string; underlying: JSONSchema7Definition } | null = null;
  for (const [refName, ref] of Object.entries(refs)) {
    if (equal(ref, {})) {
      // Do not consider empty refs
      continue;
    }
    if (equal(ref, result)) {
      if (found != null) {
        console.debug(ref);
        console.debug(found);
        throw new Error("duplicate refs");
      }
      found = {
        ref: refName,
        underlying: ref,
      };
    }
  }

  return found == null ? result : { $ref: found.ref };
}
