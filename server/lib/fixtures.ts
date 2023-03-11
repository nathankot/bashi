import type { Session } from "@lib/session.ts";
import type { CommandSet } from "@lib/command/types.ts";
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

export const assist001CommandSet: CommandSet = {
  sendResponse: {
    cost: -100,
    description: "return response for original question/request back to user",
    returnType: "void",
    args: [
      {
        name: "answer",
        type: "string",
      },
    ],
  },
  writeResponse: {
    cost: -100,
    description: "help user write response for original question/request",
    returnType: "void",
    args: [
      {
        name: "answer",
        type: "string",
      },
    ],
  },
  getInput: {
    cost: -100,
    description:
      "get additional input from user, typically text/code used as input into other functions",
    returnType: "string",
    args: [
      {
        name: "question asking for required information",
        type: "string",
      },
    ],
  },
  createCalendarEvent: {
    cost: -1000,
    description: "create a calendar event on a certain date and time",
    returnType: "void",
    args: [
      {
        name: "iso8601Date",
        type: "string",
      },
      {
        name: "name",
        type: "string",
      },
    ],
    triggerTokens: ["calendar", "event"],
  },
  createReminder: {
    cost: -1000,
    description: "create a reminder on a certain date and time",
    returnType: "void",
    args: [
      {
        name: "iso8601Date",
        type: "string",
      },
      { name: "name", type: "string" },
    ],
    triggerTokens: ["remind", "reminder"],
  },
  sendEmail: {
    cost: 0,
    returnType: "void",
    description: `send an email`,
    args: [
      { name: "recipient", type: "string" },
      { name: "subject", type: "string" },
      { name: "contents", type: "string" },
    ],
    triggerTokens: ["email"],
  },
};

export const assist002CommandSet: CommandSet = {
  respond: {
    cost: -100,
    description:
      "return response for original question/request back to user, the return value is the users response",
    returnType: "string",
    args: [
      {
        name: "answer",
        type: "string",
      },
    ],
  },
  getInput: {
    cost: -100,
    description:
      "get additional input from user, typically text/code used as input into other functions",
    returnType: "string",
    args: [
      {
        name: "question asking for required information",
        type: "string",
      },
    ],
  },
  createCalendarEvent: {
    cost: -1000,
    description: "create a calendar event on a certain date and time",
    returnType: "void",
    args: [
      {
        name: "iso8601Date",
        type: "string",
      },
      {
        name: "name",
        type: "string",
      },
    ],
    triggerTokens: ["calendar", "event"],
  },
  createReminder: {
    cost: -1000,
    description: "create a reminder on a certain date and time",
    returnType: "void",
    args: [
      {
        name: "iso8601Date",
        type: "string",
      },
      { name: "name", type: "string" },
    ],
    triggerTokens: ["remind", "reminder"],
  },
  sendEmail: {
    cost: 0,
    returnType: "void",
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
    timezoneName: "UTC",
  },
  modelConfigurations: {
    "assist-001": {
      model: "assist-001",
      commands: assist001CommandSet,
    },
    "assist-002": {
      model: "assist-002",
      commands: assist002CommandSet,
    },
  },
};
