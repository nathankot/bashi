// import * as t from "io-ts";
import toJSONSchema, { JSONSchema7Definition } from "./to_json_schema.ts";

import { models } from "@lib/models.ts";
import { Session } from "@lib/session.ts";
import { Configuration } from "@lib/session/configuration.ts";
import * as postSessions from "@routes/api/sessions.ts";
// import * as postModelName from "@routes/api/session/requests/[modelName].ts";

// ===================================================================
// START building up of known schema definitions, order matters here.

let namedJSONSchemaObjects: Record<string, JSONSchema7Definition> = {};

for (const [modelName, model] of Object.entries(models)) {
  if (modelName === "noop") {
    continue;
  }

  namedJSONSchemaObjects[`#/components/schemas/models/${modelName}/Input`] =
    toJSONSchema(model.Input, namedJSONSchemaObjects);
  namedJSONSchemaObjects[`#/components/schemas/models/${modelName}/Output`] =
    toJSONSchema(model.Output, namedJSONSchemaObjects);
  namedJSONSchemaObjects[
    `#/components/schemas/models/${modelName}/Configuration`
  ] = toJSONSchema(model.Configuration, namedJSONSchemaObjects);
}

namedJSONSchemaObjects["#/components/schemas/SessionConfiguration"] =
  toJSONSchema(Configuration, namedJSONSchemaObjects);

namedJSONSchemaObjects["#/components/schemas/Session"] = toJSONSchema(
  Session,
  namedJSONSchemaObjects
);

// END building up of known schema definitions, order matters here.
// ===================================================================

export default async function generateSwaggerSpec() {
  console.log(
    JSON.stringify(
      toJSONSchema(postSessions.Request, namedJSONSchemaObjects),
      null,
      "  "
    )
  );
  console.log(
    JSON.stringify(
      toJSONSchema(postSessions.Response, namedJSONSchemaObjects),
      null,
      "  "
    )
  );
}
