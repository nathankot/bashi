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
