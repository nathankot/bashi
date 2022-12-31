import * as t from "io-ts";

import { equal } from "std/testing/asserts.ts";
import { OpenAPIV3 } from "openapi-types";

import { models } from "@lib/models.ts";
import {
  ArgumentParser,
  ArgumentType,
  FunctionDefinition,
} from "@lib/function/types.ts";
import { Configuration } from "@lib/session/configuration.ts";
import { Session } from "@lib/session.ts";
import { ResponseError } from "@lib/errors.ts";

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

export let namedJSONSchemaObjects: Record<
  string,
  OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
> = {};

export default function toJSONSchema(
  type: {
    _tag: SupportedTag;
  },
  refs: Record<
    string,
    OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
  > = namedJSONSchemaObjects
): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject {
  const recurse = (type: {
    _tag: SupportedTag;
  }): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject =>
    toJSONSchema(type, refs);

  const result: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject = (() => {
    switch (type._tag) {
      case "AnyType":
        return {} satisfies OpenAPIV3.SchemaObject;
      case "StringType":
        return { type: "string" } satisfies OpenAPIV3.SchemaObject;
      case "NumberType":
        return { type: "number" } satisfies OpenAPIV3.SchemaObject;
      case "BooleanType":
        return { type: "boolean" } satisfies OpenAPIV3.SchemaObject;
      case "ArrayType":
        return {
          type: "array",
          items: recurse((type as any).type),
        } satisfies OpenAPIV3.SchemaObject;
      case "LiteralType":
        const lit = type as t.LiteralType<any>;
        return {
          enum: [lit.value],
          type: typeof lit.value as any,
        } satisfies OpenAPIV3.SchemaObject;
      case "IntersectionType":
        const intersection = type as t.IntersectionType<any[]>;
        return {
          allOf: intersection.types.map((t) => recurse(t)),
        } satisfies OpenAPIV3.SchemaObject;
      case "UnionType":
        const union = type as t.UnionType<any[]>;
        return {
          anyOf: union.types.map((t) => recurse(t)),
        } satisfies OpenAPIV3.SchemaObject;
      case "DictionaryType":
        const dict = type as t.DictionaryType<t.StringType, any>;
        return {
          type: "object",
          additionalProperties: recurse(dict.codomain),
        } satisfies OpenAPIV3.SchemaObject;
      case "PartialType":
        const partial = type as t.PartialType<
          Record<string, { _tag: SupportedTag }>
        >;
        return {
          type: "object",
          properties: Object.entries(partial.props).reduce(
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
        } satisfies OpenAPIV3.SchemaObject;
      case "InterfaceType":
        const iface = type as t.InterfaceType<
          Record<string, { _tag: SupportedTag }>
        >;
        const propNames = Object.keys(iface.props);
        return {
          type: "object",
          required: propNames.length > 0 ? propNames : undefined,
          properties: Object.entries(iface.props).reduce(
            (a, [p, t]) => ({ ...a, [p]: recurse(t) }),
            {}
          ),
        } satisfies OpenAPIV3.SchemaObject;
      case "KeyofType":
        const kof = type as t.KeyofType<{ [key: string]: unknown }>;
        return {
          oneOf: Object.keys(kof.keys).map((k) => ({
            enum: [k],
            type: typeof k as any,
          })),
        } satisfies OpenAPIV3.SchemaObject;
      case undefined:
        if ("name" in type && type.name === "Date") {
          return {
            type: "string",
            format: "full-date",
          } satisfies OpenAPIV3.SchemaObject;
        }
        console.debug(type);
        throw new Error(`unsupported type`);
      default:
        const exhaustiveCheck: never = type._tag;
        console.debug(type);
        throw new Error(`unsupported type: ${exhaustiveCheck}`);
    }
  })();

  let found: {
    ref: string;
    underlying: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  } | null = null;
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

  return found == null
    ? result
    : ({ $ref: found.ref } satisfies OpenAPIV3.ReferenceObject);
}

// ===================================================================
// START building up of known schema definitions, order matters here.

namedJSONSchemaObjects["#/components/schemas/Error"] =
  toJSONSchema(ResponseError);

namedJSONSchemaObjects["#/components/schemas/ArgumentParser"] =
  toJSONSchema(ArgumentParser);
namedJSONSchemaObjects["#/components/schemas/ArgumentType"] =
  toJSONSchema(ArgumentType);
namedJSONSchemaObjects["#/components/schemas/FunctionDefinition"] =
  toJSONSchema(FunctionDefinition);

for (const [modelName, model] of Object.entries(models)) {
  if (modelName === "noop") {
    continue;
  }

  // Custom request handlers will come with their own public-facing input schema definition.
  if (!("customRequestHandler" in model)) {
    namedJSONSchemaObjects[`#/components/schemas/models_${modelName}_Input`] =
      toJSONSchema(model.Input);
  }

  namedJSONSchemaObjects[`#/components/schemas/models_${modelName}_Output`] =
    toJSONSchema(model.Output);
  namedJSONSchemaObjects[
    `#/components/schemas/models_${modelName}_Configuration`
  ] = toJSONSchema(model.Configuration);
}

namedJSONSchemaObjects["#/components/schemas/SessionConfiguration"] =
  toJSONSchema(Configuration);

namedJSONSchemaObjects["#/components/schemas/Session"] = toJSONSchema(Session);

// END building up of known schema definitions, order matters here.
// ===================================================================
