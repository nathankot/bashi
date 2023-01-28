import * as t from "io-ts";
import * as p from "typescript-parsec";

import {
  // Token,
  buildLexer,
  rule,
  expectEOF,
  expectSingleResult,
} from "typescript-parsec";

import { Value } from "@lib/valueTypes.ts";

export type Call = {
  type: "call";
  name: string;
  args: Expr[];
};
export const Call: t.Type<Call> = t.recursion("Call", () =>
  t.type({
    type: t.literal("call"),
    name: t.string,
    args: t.array(Expr),
  })
);

export type Expr = Call | Value;
export const Expr: t.Type<Expr> = t.recursion("Expr", () =>
  t.union([Call, Value])
);

export const ActionGroup = t.intersection([
  t.type({
    thought: t.string,
    action: t.string,
    functionCalls: t.array(Call),
  }),
  t.partial({
    result: t.string,
  }),
]);
export type ActionGroup = t.TypeOf<typeof ActionGroup>;

enum ExprTokenKind {
  Identifier,

  TrueLiteral,
  FalseLiteral,
  NumberLiteral,
  SingleQuoteStringLiteral,
  DoubleQuoteStringLiteral,
  BackQuoteStringLiteral,

  Plus,
  LParen,
  RParen,
  Space,
  Comma,
  SemiColon,
}

const exprLexer = buildLexer([
  [true, /^'([^'\\]|\\.)*'/g, ExprTokenKind.SingleQuoteStringLiteral],
  [true, /^"([^"\\]|\\.)*"/g, ExprTokenKind.DoubleQuoteStringLiteral],
  [true, /^`([^`\\]|\\.)*`/g, ExprTokenKind.BackQuoteStringLiteral],
  [true, /^[\+\-]?\d+(\.\d+)?/g, ExprTokenKind.NumberLiteral],
  [true, /^true/g, ExprTokenKind.TrueLiteral],
  [true, /^false/g, ExprTokenKind.FalseLiteral],

  [true, /^[a-zA-Z_-][a-zA-Z0-9_-]*/g, ExprTokenKind.Identifier],

  [true, /^\+/g, ExprTokenKind.Plus],
  [true, /^\(/g, ExprTokenKind.LParen],
  [true, /^\)/g, ExprTokenKind.RParen],
  [true, /^\,/g, ExprTokenKind.Comma],
  [true, /^;/g, ExprTokenKind.SemiColon],
  [false, /^\s+/g, ExprTokenKind.Space],
]);

const EXPR = rule<ExprTokenKind, Expr>();
const VALUE = rule<ExprTokenKind, Value>();
const CALL = rule<ExprTokenKind, Call>();
const CALLS = rule<ExprTokenKind, Call[]>();

EXPR.setPattern(p.alt(VALUE, CALL));

VALUE.setPattern(
  p.apply(
    p.alt(
      p.tok(ExprTokenKind.TrueLiteral),
      p.tok(ExprTokenKind.FalseLiteral),
      p.tok(ExprTokenKind.NumberLiteral),
      p.tok(ExprTokenKind.SingleQuoteStringLiteral),
      p.tok(ExprTokenKind.DoubleQuoteStringLiteral),
      p.tok(ExprTokenKind.BackQuoteStringLiteral)
    ),
    (tok) => {
      switch (tok.kind) {
        case ExprTokenKind.TrueLiteral:
          return { type: "boolean", value: true };
        case ExprTokenKind.FalseLiteral:
          return { type: "boolean", value: false };
        case ExprTokenKind.NumberLiteral:
          return { type: "number", value: +tok.text };
        case ExprTokenKind.SingleQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll(`\\'`, `'`),
          };
        case ExprTokenKind.DoubleQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll(`\\"`, `"`),
          };
        case ExprTokenKind.BackQuoteStringLiteral:
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

CALL.setPattern(
  p.apply(
    p.seq(
      p.tok(ExprTokenKind.Identifier),
      p.tok(ExprTokenKind.LParen),
      p.opt_sc(
        p.kleft(
          p.list(EXPR, p.tok(ExprTokenKind.Comma)),
          p.opt_sc(p.tok(ExprTokenKind.Comma))
        )
      ),
      p.tok(ExprTokenKind.RParen)
    ),
    ([{ text: name }, , maybeArgs]) => ({
      type: "call",
      name,
      args: maybeArgs ?? [],
    })
  )
);

CALLS.setPattern(
  p.apply(
    p.kleft(
      p.list(
        CALL,
        p.seq(
          p.tok(ExprTokenKind.SemiColon),
          p.rep_sc(p.tok(ExprTokenKind.SemiColon))
        )
      ),
      p.rep_sc(p.tok(ExprTokenKind.SemiColon))
    ),
    (calls) => calls
  )
);

export function parseFunctionCall(expr: string): Call {
  return expectSingleResult(expectEOF(CALL.parse(exprLexer.parse(expr))));
}

export function parseFunctionCalls(expr: string): Call[] {
  return expectSingleResult(expectEOF(CALLS.parse(exprLexer.parse(expr))));
}

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

  [true, /^(\n|\r\n|\r)+/g, ActionTokenKind.Newline],
  [false, /^\s+/g, ActionTokenKind.Space],
]);

const ACTION_GROUP = rule<ActionTokenKind, ActionGroup>();
ACTION_GROUP.setPattern(
  p.apply(
    p.seq(
      p.apply(
        p.kright(
          p.tok(ActionTokenKind.KeywordThought),
          p.tok(ActionTokenKind.String)
        ),
        (str) => str.text.slice(1).trim()
      ),
      p.tok(ActionTokenKind.Newline),
      p.apply(
        p.kright(
          p.tok(ActionTokenKind.KeywordAction),
          p.tok(ActionTokenKind.String)
        ),
        (str) => str.text.slice(1).trim()
      ),
      p.opt_sc(
        p.apply(
          p.kright(
            p.tok(ActionTokenKind.Newline),
            p.kright(
              p.tok(ActionTokenKind.KeywordResult),
              p.tok(ActionTokenKind.String)
            )
          ),
          (str) => {
            const result = str.text.slice(1).trim();
            if (result.length === 0) {
              return undefined;
            }
            return result;
          }
        )
      )
    ),
    ([thought, , action, result]) => {
      const functionCalls = parseFunctionCalls(action);
      return {
        thought,
        action,
        result,
        functionCalls,
      };
    }
  )
);

export function parseActionGroup(expr: string): ActionGroup {
  return expectSingleResult(
    expectEOF(ACTION_GROUP.parse(actionLexer.parse(expr)))
  );
}
