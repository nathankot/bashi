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

enum T {
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
  [true, /^'([^'\\]|\\.)*'/g, T.SingleQuoteStringLiteral],
  [true, /^"([^"\\]|\\.)*"/g, T.DoubleQuoteStringLiteral],
  [true, /^`([^`\\]|\\.)*`/g, T.BackQuoteStringLiteral],
  [true, /^[\+\-]?\d+(\.\d+)?/g, T.NumberLiteral],
  [true, /^true/g, T.TrueLiteral],
  [true, /^false/g, T.FalseLiteral],

  [true, /^[a-zA-Z_-][a-zA-Z0-9_-]*/g, T.Identifier],

  [true, /^\+/g, T.Plus],
  [true, /^\(/g, T.LParen],
  [true, /^\)/g, T.RParen],
  [true, /^\,/g, T.Comma],
  [true, /^;/g, T.SemiColon],
  [false, /^\s+/g, T.Space],
]);

const PAREN_GROUP = rule<T, Expr>();
const VALUE = rule<T, Value>();
const INFIX_CALL = rule<T, Expr>();
const FUNC_CALL = rule<T, Call>();
const FUNC_CALLS = rule<T, Call[]>();

const EXPR = p.alt(VALUE, FUNC_CALL, INFIX_CALL, PAREN_GROUP);
const EXPR_WITHOUT_INFIX_CALL = p.alt(VALUE, FUNC_CALL, PAREN_GROUP);

PAREN_GROUP.setPattern(p.kmid(p.tok(T.LParen), EXPR, p.tok(T.RParen)));

VALUE.setPattern(
  p.apply(
    p.alt(
      p.tok(T.TrueLiteral),
      p.tok(T.FalseLiteral),
      p.tok(T.NumberLiteral),
      p.tok(T.SingleQuoteStringLiteral),
      p.tok(T.DoubleQuoteStringLiteral),
      p.tok(T.BackQuoteStringLiteral)
    ),
    (tok) => {
      switch (tok.kind) {
        case T.TrueLiteral:
          return { type: "boolean", value: true };
        case T.FalseLiteral:
          return { type: "boolean", value: false };
        case T.NumberLiteral:
          return { type: "number", value: +tok.text };
        case T.SingleQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll(`\\'`, `'`),
          };
        case T.DoubleQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll(`\\"`, `"`),
          };
        case T.BackQuoteStringLiteral:
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

FUNC_CALL.setPattern(
  // standard form: f(a1, a2)
  p.apply(
    p.seq(
      p.tok(T.Identifier),
      p.tok(T.LParen),
      p.opt_sc(
        p.kleft(p.list_sc(EXPR, p.tok(T.Comma)), p.opt_sc(p.tok(T.Comma)))
      ),
      p.tok(T.RParen)
    ),
    ([{ text: name }, , maybeArgs]) => ({
      type: "call",
      name,
      args: maybeArgs ?? [],
    })
  )
);

INFIX_CALL.setPattern(
  // operand form: a1 `f` a2
  p.lrec_sc(
    p.apply(
      p.seq(EXPR_WITHOUT_INFIX_CALL, p.tok(T.Plus), EXPR_WITHOUT_INFIX_CALL),
      ([lhs, operand, rhs]): Call => ({
        type: "call",
        name: "__" + operand.text + "__",
        args: [lhs, rhs],
      })
    ),
    p.seq(p.tok(T.Plus), EXPR_WITHOUT_INFIX_CALL),
    (lhs, [operand, rhs]): Call => ({
      type: "call",
      name: "__" + operand.text + "__",
      args: [lhs, rhs],
    })
  )
);

FUNC_CALLS.setPattern(
  p.apply(
    p.kleft(
      p.list_sc(
        FUNC_CALL,
        p.seq(p.tok(T.SemiColon), p.rep_sc(p.tok(T.SemiColon)))
      ),
      p.rep_sc(p.tok(T.SemiColon))
    ),
    (calls) => calls
  )
);

export function parseFunctionCall(expr: string): Call {
  return expectSingleResult(expectEOF(FUNC_CALL.parse(exprLexer.parse(expr))));
}

export function parseFunctionCalls(expr: string): Call[] {
  return expectSingleResult(expectEOF(FUNC_CALLS.parse(exprLexer.parse(expr))));
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
