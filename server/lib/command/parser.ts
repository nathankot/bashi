import * as p from "typescript-parsec";

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

const ARG = rule<TokenKind, Value>();
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
            `Unsupported value kind: ${(exhaustiveCheck as any).text}`
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
