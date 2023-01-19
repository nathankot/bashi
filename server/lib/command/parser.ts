import * as p from "typescript-parsec";
import { parseDate } from "chrono";

import {
  // Token,
  buildLexer,
  rule,
  expectEOF,
  expectSingleResult,
} from "typescript-parsec";

import { Value } from "@lib/valueTypes.ts";

enum ActionTokenKind {
  KeywordThought,
  KeywordAction,
  KeywordResult,

  String,

  Newline,
  Space,
}

const actionLexer = buildLexer([
  [true, /^Action/gi, ActionTokenKind.KeywordAction],
  [true, /^Thought/gi, ActionTokenKind.KeywordThought],
  [true, /^Result/gi, ActionTokenKind.KeywordResult],

  [true, /^:.*/g, ActionTokenKind.String],

  [true, /^(\n|\r\n|\r)*/g, ActionTokenKind.Newline],
  [false, /^\s+/g, ActionTokenKind.Space],
]);

export type ActionGroup = {
  thought: string;
  action: string;
  result?: string;
};

const ACTION_GROUP = rule<ActionTokenKind, ActionGroup>();
ACTION_GROUP.setPattern(
  p.apply(
    p.seq(
      p.apply(
        p.seq(
          p.tok(ActionTokenKind.KeywordThought),
          p.tok(ActionTokenKind.String)
        ),
        ([, str]) => str.text.slice(1).trim()
      ),
      p.tok(ActionTokenKind.Newline),
      p.apply(
        p.seq(
          p.tok(ActionTokenKind.KeywordAction),
          p.tok(ActionTokenKind.String)
        ),
        ([, str]) => str.text.slice(1).trim()
      ),
      p.opt(
        p.apply(
          p.seq(
            p.tok(ActionTokenKind.Newline),
            p.seq(
              p.tok(ActionTokenKind.KeywordResult),
              p.tok(ActionTokenKind.String)
            )
          ),
          ([, [, str]]) => str.text.slice(1).trim()
        )
      )
    ),
    ([thought, , action, result]) => ({
      thought,
      action,
      result,
    })
  )
);

export function parseActionGroup(expr: string): ActionGroup {
  return expectSingleResult(
    expectEOF(ACTION_GROUP.parse(actionLexer.parse(expr)))
  );
}

export type FunctionCall = {
  name: string;
  args: Value[];
};

enum TokenKind {
  Identifier,

  TrueLiteral,
  FalseLiteral,
  NumberLiteral,
  SingleQuoteStringLiteral,
  DoubleQuoteStringLiteral,
  BackQuoteStringLiteral,

  LParen,
  RParen,
  Space,
  Comma,
}

const lexer = buildLexer([
  [true, /^'([^'\\]|\\.)*'/g, TokenKind.SingleQuoteStringLiteral],
  [true, /^"([^"\\]|\\.)*"/g, TokenKind.DoubleQuoteStringLiteral],
  [true, /^`([^`\\]|\\.)*`/g, TokenKind.BackQuoteStringLiteral],
  [true, /^[\+\-]?\d+(\.\d+)?/g, TokenKind.NumberLiteral],
  [true, /^true/g, TokenKind.TrueLiteral],
  [true, /^false/g, TokenKind.FalseLiteral],

  [true, /^[a-zA-Z_-][a-zA-Z0-9_-]*/g, TokenKind.Identifier],

  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^\,/g, TokenKind.Comma],
  [false, /^\s+/g, TokenKind.Space],
]);

const ARG = rule<TokenKind, Argument>();
ARG.setPattern(
  p.apply(
    p.alt(
      p.tok(TokenKind.TrueLiteral),
      p.tok(TokenKind.FalseLiteral),
      p.tok(TokenKind.NumberLiteral),
      p.tok(TokenKind.SingleQuoteStringLiteral),
      p.tok(TokenKind.DoubleQuoteStringLiteral),
      p.tok(TokenKind.BackQuoteStringLiteral)
    ),
    (tok) => {
      switch (tok.kind) {
        case TokenKind.TrueLiteral:
          return { type: "boolean", value: true };
        case TokenKind.FalseLiteral:
          return { type: "boolean", value: false };
        case TokenKind.NumberLiteral:
          return { type: "number", value: +tok.text };
        case TokenKind.SingleQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll(`\\'`, `'`),
          };
        case TokenKind.DoubleQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll(`\\"`, `"`),
          };
        case TokenKind.BackQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll("\\`", "`"),
          };
        default:
          const exhaustiveCheck: never = tok;
          throw new Error(
            `Unsupported argument kind: ${(exhaustiveCheck as any).text}`
          );
      }
    }
  )
);

const CALL = rule<TokenKind, FunctionCall>();
CALL.setPattern(
  p.apply(
    p.seq(
      p.tok(TokenKind.Identifier),
      p.tok(TokenKind.LParen),
      p.opt(p.list(ARG, p.tok(TokenKind.Comma))),
      p.tok(TokenKind.RParen)
    ),
    (toks) => {
      const [{ text: name }, , maybeArgs] = toks;
      return {
        name,
        args: maybeArgs ?? [],
      };
    }
  )
);

export function parseFunctionCall(expr: string): FunctionCall {
  return expectSingleResult(expectEOF(CALL.parse(lexer.parse(expr))));
}

// TODO: none of below really belows in the parser

import type { Configuration } from "@lib/session.ts";

import { LogFn } from "@lib/log.ts";

import { checkArgumentsValid } from "@lib/command.ts";
import argumentParsers from "./argumentParsers.ts";
import { Command, CommandSet, CommandParsed, Argument } from "./types.ts";

type ArgParsed = Exclude<CommandParsed["argsParsed"], undefined>[number];

export type ParseDeps = {
  log: LogFn;
  now: Date;
  knownCommands: CommandSet;
  sessionConfiguration: Configuration;
};

export function preprocessCommand(
  { log, now, knownCommands, sessionConfiguration }: ParseDeps,
  line: string
): Command | null {
  if (line.trim() === "") {
    return null;
  }
  if (line.length < 3) {
    // min number of chars for a valid function is 3
    return null;
  }
  try {
    const parsed: Command = {
      type: "parsed",
      ...parseFunctionCall(line),
      line,
    };
    const command = knownCommands[parsed.name];
    // Check that the command is known
    if (command == null) {
      return {
        ...parsed,
        type: "invalid",
        invalidReason: "unknown_command",
      };
    }
    if (!checkArgumentsValid(command, parsed.args)) {
      return {
        ...parsed,
        type: "invalid",
        invalidReason: "invalid_arguments",
      };
    }

    // TODO: this should probably be lifted outside of the parser:

    // Do any additional argument parsing:
    parsed.argsParsed = command.args.map((argDef, i) =>
      (argDef.parse ?? []).reduce((a, e) => {
        const value = parsed.args[i];
        if (value == null) {
          return a;
        }
        try {
          const argParser = argumentParsers[e];
          if (argParser.inputType != value.type) {
            throw new Error(
              `expected parser input to be ${argParser.inputType} got ${value.type}`
            );
          }
          let v: Value | null = argParser.fn(
            {
              now,
              chronoParseDate: parseDate,
              timezoneUtcOffset: sessionConfiguration.timezoneUtcOffset,
            },
            value.value
          );

          if (v == null) {
            return a;
          }

          return {
            ...a,
            [e]: v,
          } satisfies ArgParsed;
        } catch (e) {
          log("error", e);
          return a;
        }
      }, {})
    );

    return parsed;
  } catch (e) {
    return {
      type: "parse_error",
      line,
      error: (e as any).message ?? "",
    };
  }
}
