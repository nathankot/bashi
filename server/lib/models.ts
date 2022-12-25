import * as t from "io-ts";
import * as f from "fp-ts";

import HTTPError from "@lib/http_error.ts";
import { ModelDeps } from "./models/model_deps.ts";

////////////////////////////////////////////////////
// BEGIN section to edit when adding new models

import * as assist000 from "./models/assist_000.ts";
import * as translate000 from "./models/translate_000.ts";
import * as code000 from "./models/code_000.ts";
import * as noop from "./models/noop.ts";
import * as whisper000 from "./models/whisper_000.ts";
import * as passthroughOpenAi000 from "./models/passthrough_openai_000.ts";

export const models = {
  "assist-000": assist000,
  "translate-000": translate000,
  "code-000": code000,
  "whisper-000": whisper000,
  "passthrough-openai-000": passthroughOpenAi000,
  noop: noop,
};

export const AllConfiguration = t.union([
  assist000.Configuration,
  noop.Configuration,
  translate000.Configuration,
  code000.Configuration,
  whisper000.Configuration,
  passthroughOpenAi000.Configuration,
]);
export type AllConfiguration = t.TypeOf<typeof AllConfiguration>;

export const AllInput = t.union([
  assist000.Input,
  noop.Input,
  translate000.Input,
  code000.Input,
  whisper000.Input,
  passthroughOpenAi000.Input,
]);
export type AllInput = t.TypeOf<typeof AllInput>;

export const AllOutput = t.union([
  assist000.Output,
  noop.Output,
  translate000.Output,
  code000.Output,
  whisper000.Output,
  passthroughOpenAi000.Output,
]);
export type AllOutput = t.TypeOf<typeof AllOutput>;

// END section to edit when adding new models
////////////////////////////////////////////////////

export type { ModelDeps };

export const ModelName = t.keyof(models);
export type ModelName = t.TypeOf<typeof ModelName>;

export type InputFor<M extends ModelName> = t.TypeOf<typeof models[M]["Input"]>;

export async function run<N extends keyof typeof models>(
  modelDeps: Omit<ModelDeps, "signal">,
  modelName: N,
  input: t.TypeOf<typeof models[N]["Input"]> &
    Parameters<typeof models[N]["run"]>[2]
): Promise<t.TypeOf<typeof models[N]["Output"]>> {
  type C = t.TypeOf<typeof models[N]["Configuration"]> &
    Parameters<typeof models[N]["run"]>[1];

  type I = t.TypeOf<typeof models[N]["Input"]> &
    Parameters<typeof models[N]["run"]>[2];

  const model: typeof models[N] = models[modelName];

  if (!validateInput(modelName, input)) {
    throw new Error("could not validate input");
  }

  input satisfies I;

  const configuration: Partial<C> = {
    ...(model.defaultConfiguration as Partial<C>),
    ...((): {} | C => {
      for (const conf of modelDeps.session.modelConfigurations) {
        if (conf.model === modelName) {
          return conf;
        }
      }
      return {};
    })(),
  };

  if (!validateConfiguration(modelName, configuration)) {
    throw new HTTPError(
      `the model '${modelName}' has not been fully configured`,
      400
    );
  }

  configuration satisfies C;

  let output = await modelDeps.faultHandlingPolicy.execute(async ({ signal }) =>
    model.run({ ...modelDeps, signal }, configuration as any, input as any)
  );

  if (!validateOutput(modelName, output)) {
    throw new Error(`resulting output did not match model expectations`);
  }

  return output;
}

function validateOutput<N extends ModelName>(
  modelName: N,
  output: t.TypeOf<typeof models[ModelName]["Output"]>
): output is t.TypeOf<typeof models[N]["Output"]> {
  return f.either.isRight(models[modelName].Output.decode(output));
}

function validateInput<N extends ModelName>(
  modelName: N,
  input: t.TypeOf<typeof models[ModelName]["Input"]>
): input is t.TypeOf<typeof models[N]["Input"]> {
  return f.either.isRight(models[modelName].Input.decode(input));
}

function validateConfiguration<N extends ModelName>(
  modelName: N,
  configuration: Partial<t.TypeOf<typeof models[ModelName]["Configuration"]>>
): configuration is t.TypeOf<typeof models[N]["Configuration"]> {
  return f.either.isRight(
    models[modelName].Configuration.decode(configuration)
  );
}
