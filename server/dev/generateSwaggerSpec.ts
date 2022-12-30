import { OpenAPIV3 } from "openapi-types";

import { namedJSONSchemaObjects } from "@lib/to_json_schema.ts";
import * as postSessions from "@routes/api/sessions.ts";
// import * as postModelName from "@routes/api/session/requests/[modelName].ts";

export default async function generateSwaggerSpec() {
  // openapi.json
  const spec: OpenAPIV3.Document = {
    openapi: "3.0.3",
    info: {
      title: "Bashi",
      version: "0.1.0",
      description: "TODO",
      termsOfService: "TODO",
      license: {
        name: "TODO",
        url: "TODO",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/api/",
        description: "Local development server",
      },
    ],
    paths: {
      "/sessions": {
        post: {
          operationId: postSessions.meta.operationId,
          summary: postSessions.meta.summary,
          description: postSessions.meta.description,
          requestBody: {
            description: postSessions.meta.requestBody.description,
            required: postSessions.meta.requestBody.required,
            content: postSessions.meta.requestBody.content,
          },
          responses: {
            ...postSessions.meta.otherResponses,
            [postSessions.meta.responseSuccess.status]: {
              description: postSessions.meta.responseSuccess.description,
              content: postSessions.meta.responseSuccess.content,
            },
          },
        },
      },
    },
    components: {
      schemas: Object.entries(namedJSONSchemaObjects).reduce(
        (a, [k, t]) => ({ ...a, [k.slice("#/components/schemas/".length)]: t }),
        {}
      ) as any,
    },
  };
  console.log(spec);

  // console.log(JSON.stringify(spec, null, "  "));
}
