import type { Session } from "@lib/session.ts";
import type { FunctionSet } from "@lib/function/types.ts";
import type { HandlerContext } from "$fresh/server.ts";

export const now = new Date(1671439270000);

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

export const functionSet: FunctionSet = {
  createCalendarEvent: {
    description: "create a calendar event on a certain date and time",
    args: [
      {
        name: "relative time supported by chrono-js",
        type: "string",
        parse: ["naturalLanguageDateTime"],
      },
      {
        name: "name",
        type: "string",
      },
    ],
    triggerTokens: ["calendar", "event"],
  },
  createReminder: {
    description: "create a reminder on a certain date and time",
    args: [
      {
        name: "relative time supported by chrono-js",
        type: "string",
        parse: ["naturalLanguageDateTime"],
      },
      { name: "name", type: "string" },
    ],
    triggerTokens: ["remind", "reminder"],
  },
  sendEmail: {
    description: `send an email`,
    args: [
      { name: "recipient", type: "string" },
      { name: "subject", type: "string" },
      { name: "contents", type: "string" },
    ],
    triggerTokens: ["email"],
  },
};

export const session: Session = {
  expiresAt: new Date(new Date().getTime() + 60000),
  sessionId: "a9fb6273-00ee-4e4c-9918-e87e1157ca31",
  accountNumber: "0000000000000000",
  configuration: {
    locale: "en-US",
    maxResponseTokens: 1000,
    bestOf: 1,
    disabledBuiltinFunctions: [],
  },
  modelConfigurations: [
    {
      model: "assist-000",
      functions: functionSet,
    },
  ],
};
