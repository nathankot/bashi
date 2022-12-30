import { OpenAPIV3 } from "openapi-types";
import { equal } from "std/testing/asserts.ts";

import { namedJSONSchemaObjects } from "@lib/to_json_schema.ts";
import * as sessionsEndpoint from "@routes/api/sessions.ts";
// import * as postModelName from "@routes/api/session/requests/[modelName].ts";

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
      "/sessions": sessionsEndpoint.meta,
    },
    components: {
      schemas: Object.entries(namedJSONSchemaObjects).reduce(
        (a, [k, t]) => ({ ...a, [k.slice("#/components/schemas/".length)]: t }),
        {}
      ) as any,
      securitySchemes: {
        account_id: {
          type: "http",
          description: "Authenticate with your Account ID",
          scheme: "Bearer",
        },
      },
    },
  };

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  const existing = JSON.parse(textDecoder.decode(Deno.readFileSync(SPEC_PATH)));

  if (!equal(existing, spec)) {
    Deno.writeFileSync(
      SPEC_PATH,
      textEncoder.encode(JSON.stringify(spec, null, "  "))
    );
  }
}
