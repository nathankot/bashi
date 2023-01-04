import * as t from "io-ts";

import { equal } from "std/testing/asserts.ts";
import { OpenAPIV3 } from "openapi-types";

import { models } from "@lib/models.ts";
import { Configuration } from "@lib/session/configuration.ts";
import { SessionPublic } from "@lib/session.ts";
import { ResponseError } from "@lib/errors.ts";

import {
  StringValue,
  NumberValue,
  BooleanValue,
  ArgumentParser,
  ArgumentType,
  FunctionDefinition,
  FunctionCall,
  FunctionCallExecuted,
  FunctionCallInvalid,
  FunctionCallParseError,
  FunctionCallParsed,
} from "@lib/function/types.ts";

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

        const intersectionTypes = intersection.types.map((t) => recurse(t));

        // If the this is an intersection of objects, then combine
        // the object properties manually in order to get a nicer schema:
        if (
          intersectionTypes.every(
            (t) =>
              "type" in t &&
              t.type === "object" &&
              (!("additionalProperties" in t) ||
                t.additionalProperties === false)
          )
        ) {
          const ts = intersectionTypes as OpenAPIV3.SchemaObject[] & {
            type: "object";
          };
          return {
            type: "object",

            required: ts
              .map((t) => t.required ?? [])
              .reduce((a, e) => [...a, ...e], []),
            properties: ts
              .map((t) => Object.entries(t.properties ?? {}) ?? [])
              .reduce((a, e) => [...a, ...e], [])
              .reduce((a, [k, v]) => ({ ...a, [k]: v }), {}),
          };
        }

        return {
          allOf: intersectionTypes,
        } satisfies OpenAPIV3.SchemaObject;
      case "UnionType":
        const union = type as t.UnionType<any[]>;

        // If this is a union of t.partial({}) | t.record(..., ...) then it
        // is just an attempt to create a partial record type:
        if (union.types.length === 2) {
          const [first, second] = union.types!;
          if (
            first._tag === "PartialType" &&
            Object.entries(first.props).length === 0 &&
            second._tag === "DictionaryType"
          ) {
            return {
              ...recurse(second),
              required: undefined,
            };
          }
        }

        const childTypes = union.types.map((t) => recurse(t));

        // If this is a union of ref objects, and the objects have a common
        // discriminator, use it.
        let possibleDiscriminators: Record<string, Record<string, string>> = {};
        let excludedDiscriminators = new Set<string>();
        for (let childType of childTypes) {
          if (!("$ref" in childType)) {
            possibleDiscriminators = {};
            break;
          }
          const deref = refs[childType.$ref];
          if (deref == null) {
            throw new Error(`could not deref ${childType.$ref}`);
          }
          if (!("type" in deref)) {
            possibleDiscriminators = {};
            break;
          }
          if (deref.type !== "object") {
            possibleDiscriminators = {};
            break;
          }
          for (const [n, t] of Object.entries(deref.properties ?? {})) {
            if (!("type" in t) || t.type !== "string") {
              continue;
            }
            // Only accept properties that are represented by a string literal
            if (t.enum == null || t.enum.length !== 1) {
              continue;
            }
            const typeName = t.enum[0]!;
            possibleDiscriminators = {
              ...possibleDiscriminators,
              [n]: {
                ...possibleDiscriminators[n],
                [typeName]: childType.$ref,
              },
            };
          }
          for (const [e] of Object.entries(possibleDiscriminators)) {
            if (!(deref.required ?? []).includes(e)) {
              // Can't use it if the property is not required on all types.
              excludedDiscriminators.add(e);
            }
          }
        }
        const viableDiscriminators = Object.entries(
          possibleDiscriminators
        ).filter(([x]) => !excludedDiscriminators.has(x));

        let result: OpenAPIV3.SchemaObject = {
          oneOf: childTypes,
        };

        if (viableDiscriminators.length === 1) {
          const [discriminatorName, mapping] = viableDiscriminators[0]!;
          result.discriminator = {
            propertyName: discriminatorName,
            mapping,
          };
        }

        return result;
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
          enum: Object.keys(kof.keys),
          type: "string",
        } satisfies OpenAPIV3.SchemaObject;
      case undefined:
        if ("name" in type && type.name === "Date") {
          return {
            type: "string",
            format: "date-time",
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

namedJSONSchemaObjects["#/components/schemas/StringValue"] =
  toJSONSchema(StringValue);
namedJSONSchemaObjects["#/components/schemas/NumberValue"] =
  toJSONSchema(NumberValue);
namedJSONSchemaObjects["#/components/schemas/BooleanValue"] =
  toJSONSchema(BooleanValue);

namedJSONSchemaObjects["#/components/schemas/ArgumentParser"] =
  toJSONSchema(ArgumentParser);
namedJSONSchemaObjects["#/components/schemas/ArgumentType"] =
  toJSONSchema(ArgumentType);

namedJSONSchemaObjects["#/components/schemas/FunctionCallExecuted"] =
  toJSONSchema(FunctionCallExecuted);
namedJSONSchemaObjects["#/components/schemas/FunctionCallInvalid"] =
  toJSONSchema(FunctionCallInvalid);
namedJSONSchemaObjects["#/components/schemas/FunctionCallParseError"] =
  toJSONSchema(FunctionCallParseError);
namedJSONSchemaObjects["#/components/schemas/FunctionCallParsed"] =
  toJSONSchema(FunctionCallParsed);

namedJSONSchemaObjects["#/components/schemas/FunctionDefinition"] =
  toJSONSchema(FunctionDefinition);
namedJSONSchemaObjects["#/components/schemas/FunctionCall"] =
  toJSONSchema(FunctionCall);

for (const [modelName, model] of Object.entries(models)) {
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

namedJSONSchemaObjects["#/components/schemas/Session"] =
  toJSONSchema(SessionPublic);

// END building up of known schema definitions, order matters here.
// ===================================================================
