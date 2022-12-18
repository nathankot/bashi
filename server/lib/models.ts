import * as t from "io-ts";
import * as f from "fp-ts";

import { Session } from "@lib/session.ts";
import HTTPError from "@lib/http_error.ts";
import { ModelDeps } from "./model_deps.ts";
import * as assistDavinci003 from "./models/assist_davinci_003.ts";
import * as translateDavinci003 from "./models/translate_davinci_003.ts";
import * as noop from "./models/noop.ts";

////////////////////////////////////////////////////
// BEGIN section to edit when adding new models

export const models = {
  "assist-davinci-003": assistDavinci003,
  "translate-davinci-003": translateDavinci003,
  noop: noop,
};

export const Configuration = t.union([
  assistDavinci003.Configuration,
  noop.Configuration,
  translateDavinci003.Configuration,
]);
export type Configuration = t.TypeOf<typeof Configuration>;

export const Input = t.union([
  assistDavinci003.Input,
  noop.Input,
  translateDavinci003.Input,
]);
export type Input = t.TypeOf<typeof Input>;

export const Output = t.union([
  assistDavinci003.Output,
  noop.Output,
  translateDavinci003.Output,
]);
export type Output = t.TypeOf<typeof Output>;

// END section to edit when adding new models
////////////////////////////////////////////////////

export type ModelName = keyof typeof models;

export function validateInput<N extends ModelName>(
  modelName: N,
  input: t.TypeOf<typeof models[ModelName]["Input"]>
): input is t.TypeOf<typeof models[N]["Input"]> {
  return f.either.isRight(models[modelName].Input.decode(input));
}

export function validateConfiguration<N extends ModelName>(
  modelName: N,
  configuration: t.TypeOf<typeof models[ModelName]["Configuration"]>
): configuration is t.TypeOf<typeof models[N]["Configuration"]> {
  return f.either.isRight(
    models[modelName].Configuration.decode(configuration)
  );
}

export async function run<N extends ModelName>(
  modelName: N,
  modelDeps: ModelDeps,
  session: Session,
  input: t.TypeOf<typeof models[N]["Input"]>
): Promise<t.TypeOf<typeof models[N]["Output"]>> {
  const configuration = getConfiguration(modelName, session);
  if (configuration == null) {
    throw new HTTPError(
      `the model '${modelName}' has not been configured`,
      400
    );
  }
  const runFn: typeof models[N]["run"] = models[modelName].run;
  return runFn(modelDeps, configuration as any, input as any);
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
