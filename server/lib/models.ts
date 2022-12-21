import * as t from "io-ts";
import * as f from "fp-ts";

import { Session } from "@lib/session.ts";
import HTTPError from "@lib/http_error.ts";
import { functionCallInterceptors } from "@lib/interceptors.ts";
import { ModelDeps } from "./models/model_deps.ts";
import * as assist000 from "./models/assist_000.ts";
import * as translateDavinci003 from "./models/translate_davinci_003.ts";
import * as code000 from "./models/code_000.ts";
import * as noop from "./models/noop.ts";
import * as whisper from "./models/whisper.ts";

////////////////////////////////////////////////////
// BEGIN section to edit when adding new models

export const models = {
  "assist-000": assist000,
  "translate-davinci-003": translateDavinci003,
  "code-000": code000,
  whisper: whisper,
  noop: noop,
};

export const AllConfiguration = t.union([
  assist000.Configuration,
  noop.Configuration,
  translateDavinci003.Configuration,
  code000.Configuration,
  whisper.Configuration,
]);
export type AllConfiguration = t.TypeOf<typeof AllConfiguration>;

export const AllInput = t.union([
  assist000.Input,
  noop.Input,
  translateDavinci003.Input,
  code000.Input,
  whisper.Input,
]);
export type AllInput = t.TypeOf<typeof AllInput>;

export const AllOutput = t.union([
  assist000.Output,
  noop.Output,
  translateDavinci003.Output,
  code000.Output,
  whisper.Output,
]);
export type AllOutput = t.TypeOf<typeof AllOutput>;

// END section to edit when adding new models
////////////////////////////////////////////////////

export type { ModelDeps };

export const ModelName = t.keyof(models);
export type ModelName = t.TypeOf<typeof ModelName>;

export type InputFor<M extends ModelName> = t.TypeOf<typeof models[M]["Input"]>;

export async function run<N extends ModelName>(
  modelDeps: Omit<ModelDeps, "signal">,
  modelName: N,
  input: t.TypeOf<typeof models[N]["Input"]>
): Promise<t.TypeOf<typeof models[N]["Output"]>> {
  if (!validateInput(modelName, input)) {
    throw new Error("could not validate input");
  }
  const configuration = getConfiguration(modelName, modelDeps.session);
  if (configuration == null) {
    throw new HTTPError(
      `the model '${modelName}' has not been configured`,
      400
    );
  }
  const runFn: typeof models[N]["run"] = models[modelName].run;
  let output: t.TypeOf<typeof models[N]["Output"]> =
    await modelDeps.faultHandlingPolicy.execute(async ({ signal }) =>
      runFn({ ...modelDeps, signal }, configuration as any, input as any)
    );

  if ("functionCalls" in output) {
    for (const interceptor of functionCallInterceptors) {
      output = await modelDeps.faultHandlingPolicy.execute(async ({ signal }) =>
        interceptor({ ...modelDeps, signal }, output as any)
      );
    }
  }

  return output;
}

function validateInput<N extends ModelName>(
  modelName: N,
  input: t.TypeOf<typeof models[ModelName]["Input"]>
): input is t.TypeOf<typeof models[N]["Input"]> {
  return f.either.isRight(models[modelName].Input.decode(input));
}

function getConfiguration<N extends ModelName>(
  modelName: N,
  session: Session
): null | t.TypeOf<typeof models[N]["Configuration"]> {
  const conf: any = {
    ...models[modelName].defaultConfiguration,
    ...(() => {
      for (const conf of session.modelConfigurations) {
        if (conf.model === modelName) {
          return conf;
        }
      }
      return {};
    })(),
  };
  if (validateConfiguration(modelName, conf)) {
    return conf;
  }
  return null;
}

function validateConfiguration<N extends ModelName>(
  modelName: N,
  configuration: t.TypeOf<typeof models[ModelName]["Configuration"]>
): configuration is t.TypeOf<typeof models[N]["Configuration"]> {
  return f.either.isRight(
    models[modelName].Configuration.decode(configuration)
  );
}
