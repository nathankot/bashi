import { Session } from "@lib/session.ts";
import { HandlerContext } from "$fresh/server.ts";

export const handlerCtx: HandlerContext<{}> = {
  params: {},
  render: (data) => new Response(JSON.stringify(data)),
  renderNotFound: () => new Response("", { status: 404 }),
  state: {},
  localAddr: {
    transport: "tcp",
    hostname: "127.0.0.1",
    port: 80,
  },
  remoteAddr: {
    transport: "tcp",
    hostname: "127.0.0.1",
    port: 80,
  },
};

export const session: Session = {
  expiresAt: new Date(new Date().getTime() + 60000),
  sessionId: "a9fb6273-00ee-4e4c-9918-e87e1157ca31",
  configuration: {
    locale: "en-US",
    maxResponseTokens: 1000,
    bestOf: 1,
  },
  modelConfigurations: [
    {
      model: "assist-davinci-003",
      functions: {
        email: {
          args: [
            { name: "recipient_email", type: "string" },
            { name: "email_subject", type: "string" },
            { name: "email_body", type: "string" },
          ],
          description: `Send an email`,
        },
      },
    },
  ],
};
