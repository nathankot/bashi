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
  FunctionCall,
  FunctionSet,
  FunctionDefinition,
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
      return true;
    case TokenKind.FalseLiteral:
      return false;
    case TokenKind.NumberLiteral:
      return +tok.text;
    case TokenKind.SingleQuoteStringLiteral:
      return tok.text.substring(1, tok.text.length - 1).replaceAll(`\\'`, `'`);
    case TokenKind.DoubleQuoteStringLiteral:
      return tok.text.substring(1, tok.text.length - 1).replaceAll(`\\"`, `"`);
    case TokenKind.BackQuoteStringLiteral:
      return tok.text.substring(1, tok.text.length - 1).replaceAll("\\`", "`");
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
): FunctionCall & { type: "parsed" } {
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

const CALL = rule<TokenKind, FunctionCall & { type: "parsed" }>();
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

export function evaluate(expr: string): FunctionCall & { type: "parsed" } {
  return expectSingleResult(expectEOF(CALL.parse(lexer.parse(expr))));
}

export function parseFromModelResult(
  {
    log,
    now,
    knownFunctions,
  }: {
    log: LogFn;
    now: Date;
    knownFunctions: FunctionSet;
  },
  text: string
): FunctionCall[] {
  let result: FunctionCall[] = [];

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
      const knownFunction = knownFunctions[parsed.name];
      // Check that the function is known
      if (knownFunction == null) {
        result.push({
          ...parsed,
          type: "invalid",
          invalid_reason: "unknown_function",
        });
        continue;
      }
      if (!checkArgumentsValid(knownFunction, parsed.args)) {
        result.push({
          ...parsed,
          type: "invalid",
          invalid_reason: "invalid_arguments",
        });
        continue;
      }

      // Do any additional argument parsing:
      parsed.argsParsed = knownFunction.args.map((argDef, i) =>
        (argDef.parse ?? []).reduce((a, e) => {
          const rawValue = parsed.args[i];
          if (rawValue == null) {
            return a;
          }
          try {
            const argParser = argumentParsers[e];
            switch (argParser.inputType) {
              case "string":
                if (typeof rawValue !== "string") {
                  throw new Error(
                    `expected parser input to be string got ${typeof rawValue}`
                  );
                }
                return {
                  ...a,
                  [e]: argParser.fn(
                    { now, chronoParseDate: parseDate },
                    rawValue
                  ),
                };

              default:
                const exhaustiveCheck: never = argParser.inputType;
                throw new Error(
                  `unexpected parser input type: ${exhaustiveCheck}`
                );
            }
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
  knownFunction: FunctionDefinition,
  args: Argument[]
): boolean {
  if (knownFunction.args.length !== args.length) {
    return false;
  }
  for (let i = 0; i < knownFunction.args.length; i++) {
    const argDef = knownFunction.args[i]!;
    const arg = args[i]!;
    if (typeof arg !== argDef.type) {
      return false;
    }
  }
  return true;
}
