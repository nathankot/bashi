export function renderError(
  statusCode: 400 | 404 | 401 | 500,
  message: string
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
