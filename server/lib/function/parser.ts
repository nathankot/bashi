import * as p from "typescript-parsec";
import { parseDate } from "chrono";

import {
  Token,
  buildLexer,
  rule,
  expectEOF,
  expectSingleResult,
} from "typescript-parsec";

import { LogFn } from "@lib/log.ts";

import argumentParsers from "./argumentParsers.ts";

import {
  Command,
  CommandSet,
  CommandDefinition,
  Argument,
} from "./types.ts";

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

function applyLiteral(
  tok:
    | Token<TokenKind.TrueLiteral>
    | Token<TokenKind.FalseLiteral>
    | Token<TokenKind.NumberLiteral>
    | Token<TokenKind.SingleQuoteStringLiteral>
    | Token<TokenKind.DoubleQuoteStringLiteral>
    | Token<TokenKind.BackQuoteStringLiteral>
): Argument {
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

function applyCall(
  toks: [
    Token<TokenKind.Identifier>,
    Token<TokenKind.LParen>,
    undefined | Argument[],
    Token<TokenKind.RParen>
  ]
): Command & { type: "parsed" } {
  const [{ text: name }, , maybeArgs] = toks;
  return {
    type: "parsed",
    line: "",
    name,
    args: maybeArgs ?? [],
  };
}

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
    applyLiteral
  )
);

const CALL = rule<TokenKind, Command & { type: "parsed" }>();
CALL.setPattern(
  p.apply(
    p.seq(
      p.tok(TokenKind.Identifier),
      p.tok(TokenKind.LParen),
      p.opt(p.list(ARG, p.tok(TokenKind.Comma))),
      p.tok(TokenKind.RParen)
    ),
    applyCall
  )
);

export function evaluate(expr: string): Command & { type: "parsed" } {
  return expectSingleResult(expectEOF(CALL.parse(lexer.parse(expr))));
}

export function parseFromModelResult(
  {
    log,
    now,
    knownCommands,
  }: {
    log: LogFn;
    now: Date;
    knownCommands: CommandSet;
  },
  text: string
): Command[] {
  let result: Command[] = [];

  for (const line of text.split("\n")) {
    if (line.trim() === "") {
      continue;
    }
    if (line.length < 3) {
      // min number of chars for a valid function is 3
      continue;
    }
    if (line === "```") {
      continue;
    }
    try {
      const parsed = {
        ...evaluate(line),
        line,
      };
      const command = knownCommands[parsed.name];
      // Check that the command is known
      if (command == null) {
        result.push({
          ...parsed,
          type: "invalid",
          invalidReason: "unknown_command",
        });
        continue;
      }
      if (!checkArgumentsValid(command, parsed.args)) {
        result.push({
          ...parsed,
          type: "invalid",
          invalidReason: "invalid_arguments",
        });
        continue;
      }

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
            return {
              ...a,
              [e]: argParser.fn(
                { now, chronoParseDate: parseDate },
                value.value
              ),
            };
          } catch (e) {
            log("error", e);
            return a;
          }
        }, {})
      );

      result.push(parsed);
    } catch (e) {
      result.push({
        type: "parse_error",
        line,
        error: (e as any).message ?? "",
      });
    }
  }

  return result;
}

export function checkArgumentsValid(
  knownCommand: CommandDefinition,
  args: Argument[]
): boolean {
  if (knownCommand.args.length !== args.length) {
    return false;
  }
  for (let i = 0; i < knownCommand.args.length; i++) {
    const argDef = knownCommand.args[i]!;
    const arg = args[i]!;
    if (arg.type !== argDef.type) {
      return false;
    }
  }
  return true;
}
