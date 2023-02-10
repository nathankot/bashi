import { OpenAPIV3 } from "openapi-types";
import { equal } from "std/testing/asserts.ts";

import { log } from "@lib/log.ts";
import { ResponseError } from "@lib/errors.ts";
import { namedJSONSchemaObjects } from "@lib/toJsonSchema.ts";
import toJSONSchema from "@lib/toJsonSchema.ts";

import * as sessionsEndpoint from "@routes/api/sessions.ts";
import * as modelNameEndpoint from "@routes/api/session/requests/[modelName].ts";

const SPEC_PATH = "./static/openapi.json";

export default async function generateOpenAPISpec() {
  const spec: OpenAPIV3.Document = {
    openapi: "3.0.3",
    info: {
      title: "Bashi",
      version: "0.1.0",
      description: "TODO",
      termsOfService: "TODO",
      license: {
        name: "GNU AFFERO GENERAL PUBLIC LICENSE",
        url: "https://www.gnu.org/licenses/",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/api",
        description: "Local development server",
      },
    ],
    paths: {
      "/sessions": sessionsEndpoint.meta,
      ...Object.entries(modelNameEndpoint.meta).reduce(
        (a, [modelName, pathItemObject]) => ({
          ...a,
          [`/session/requests/${modelName}`]: pathItemObject,
        }),
        {}
      ),
    },
    components: {
      schemas: Object.entries(namedJSONSchemaObjects).reduce(
        (a, [k, t]) => ({ ...a, [k.slice("#/components/schemas/".length)]: t }),
        {}
      ) as any,
      securitySchemes: {
        account_number: {
          type: "http",
          description: "Authenticate with your Account ID",
          scheme: "Bearer",
        },
      },
      parameters: {
        session_id: {
          in: "header",
          name: "Session-ID",
          required: true,
          description: "A session_id retrieved from POST /sessions",
          schema: { type: "string" },
        },
      },
      responses: {
        error: {
          description: "TODO",
          content: {
            "application/json": {
              schema: toJSONSchema(ResponseError),
            },
          },
        },
      },
    },
  };

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  const existing = JSON.parse(textDecoder.decode(Deno.readFileSync(SPEC_PATH)));

  if (!equal(existing, spec)) {
    log("info", "writing new openapi schema");

    Deno.writeFileSync(
      SPEC_PATH,
      textEncoder.encode(JSON.stringify(spec, null, "  "))
    );
  }
}
