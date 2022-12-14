import * as t from "io-ts";

export function renderError<T extends {}>(
  statusCode: 400 | 404 | 401 | 500,
  message: string,
  mergeWith?: T
): Response {
  return new Response(JSON.stringify({ error: message, ...mergeWith }), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function renderJSON<T extends {}>(
  json: T,
  status: 200 | 201 = 200
): Response {
  return new Response(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function iotsPick<P extends t.Props, K extends keyof P>(
  Model: t.TypeC<P>,
  keys: K[]
): t.TypeC<Pick<P, K>> {
  const pickedProps = {} as Pick<P, K>;
  keys.forEach((key) => {
    pickedProps[key] = Model.props[key];
  });
  return t.type(pickedProps);
}

export function iotsOmit<P extends t.Props, K extends keyof P>(
  Model: t.TypeC<P>,
  keys: K[]
): t.TypeC<Pick<P, Exclude<keyof P, K>>> {
  const allKeys = Object.keys(Model.props) as K[];
  const keysToKeep = allKeys.filter((x) => !keys.includes(x)) as Exclude<
    typeof allKeys,
    typeof keys
  >;
  return iotsPick(Model, keysToKeep);
}
