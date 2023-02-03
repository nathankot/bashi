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
    expressions: t.array(Expr),
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

  KeywordConst,
  KeywordLet,
  KeywordVar,

  // BackQuote,
  // Other,
  Equals,
  Plus,
  LParen,
  RParen,
  Space,
  Comma,
  SemiColon,
}

const lexer = buildLexer([
  [true, /^'([^'\\]|\\.)*'/g, T.SingleQuoteStringLiteral],
  [true, /^"([^"\\]|\\.)*"/g, T.DoubleQuoteStringLiteral],
  [true, /^`([^`\\]|\\.)*`/g, T.BackQuoteStringLiteral],
  [true, /^[\+\-]?\d+(\.\d+)?/g, T.NumberLiteral],
  [true, /^true/g, T.TrueLiteral],
  [true, /^false/g, T.FalseLiteral],
  [true, /^const/g, T.KeywordConst],
  [true, /^let/g, T.KeywordLet],
  [true, /^var/g, T.KeywordVar],

  [true, /^[a-zA-Z_-][a-zA-Z0-9_-]*/g, T.Identifier],

  [true, /^\+/g, T.Plus],
  [true, /^=/g, T.Equals],
  [true, /^\(/g, T.LParen],
  [true, /^\)/g, T.RParen],
  [true, /^\,/g, T.Comma],
  [true, /^;/g, T.SemiColon],
  // [true, /^`/g, T.BackQuote]
  // [true, /^./g, T.Other]
  [true, /^\s+/g, T.Space],
]);

const PAREN_GROUP = rule<T, Expr>();
const VALUE = rule<T, Value>();
const INFIX_CALL = rule<T, Expr>();
const FUNC_CALL = rule<T, Call>();
const VAR_REF = rule<T, Call>();

const EXPR = p.alt(VALUE, FUNC_CALL, INFIX_CALL, PAREN_GROUP, VAR_REF);
const EXPR_WITHOUT_INFIX_CALL = p.alt(VALUE, FUNC_CALL, PAREN_GROUP, VAR_REF);
const STATEMENT = rule<T, Expr>();
const STATEMENTS = rule<T, Expr[]>();

const ANY_SPACE = p.rep_sc(p.tok(T.Space));

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

VAR_REF.setPattern(
  p.apply(p.tok(T.Identifier), (id) => ({
    type: "call",
    name: "$ref",
    args: [{ type: "string", value: id.text }],
  }))
);

FUNC_CALL.setPattern(
  // standard form: f(a1, a2)
  p.apply(
    p.seq(
      p.tok(T.Identifier),
      p.tok(T.LParen),
      p.opt_sc(
        p.kleft(
          p.list_sc(EXPR, p.seq(ANY_SPACE, p.tok(T.Comma), ANY_SPACE)),
          p.opt_sc(p.seq(ANY_SPACE, p.tok(T.Comma), ANY_SPACE))
        )
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
      p.seq(
        EXPR_WITHOUT_INFIX_CALL,
        ANY_SPACE,
        p.tok(T.Plus),
        ANY_SPACE,
        EXPR_WITHOUT_INFIX_CALL
      ),
      ([lhs, , operand, , rhs]): Call => ({
        type: "call",
        name: "__" + operand.text + "__",
        args: [lhs, rhs],
      })
    ),
    p.seq(ANY_SPACE, p.tok(T.Plus), ANY_SPACE, EXPR_WITHOUT_INFIX_CALL),
    (lhs, [, operand, , rhs]): Call => ({
      type: "call",
      name: "__" + operand.text + "__",
      args: [lhs, rhs],
    })
  )
);

STATEMENT.setPattern(
  p.alt(
    EXPR,
    p.kright(
      p.opt(
        p.seq(
          p.alt(
            p.tok(T.KeywordConst),
            p.tok(T.KeywordLet),
            p.tok(T.KeywordVar)
          ),
          ANY_SPACE
        )
      ),
      p.apply(
        p.seq(p.tok(T.Identifier), ANY_SPACE, p.tok(T.Equals), ANY_SPACE, EXPR),
        ([id, , , , expr]): Call => ({
          type: "call",
          name: "__=__",
          args: [{ type: "string", value: id.text }, expr],
        })
      )
    )
  )
);

STATEMENTS.setPattern(
  p.kleft(
    p.list_sc(
      STATEMENT,
      p.seq(
        ANY_SPACE,
        p.tok(T.SemiColon),
        p.rep_sc(p.tok(T.SemiColon)),
        ANY_SPACE
      )
    ),
    p.seq(ANY_SPACE, p.rep_sc(p.tok(T.SemiColon)), ANY_SPACE)
  )
);

export function parseExpression(str: string): Expr {
  return expectSingleResult(
    expectEOF(p.kmid(ANY_SPACE, EXPR, ANY_SPACE).parse(lexer.parse(str)))
  );
}

export function parseStatements(str: string): Expr[] {
  return expectSingleResult(
    expectEOF(p.kmid(ANY_SPACE, STATEMENTS, ANY_SPACE).parse(lexer.parse(str)))
  );
}

enum T2 {
  KeywordThought,
  KeywordAction,
  KeywordResult,

  Char,
  Newline,
}

const actionLexer = buildLexer([
  [true, /^\n( *?)Thought( *?):/gi, T2.KeywordThought],
  [true, /^\n( *?)Action( *?):/gi, T2.KeywordAction],
  [true, /^\n( *?)Result( *?):/gi, T2.KeywordResult],
  [true, /^\n/g, T2.Newline],
  [true, /^./g, T2.Char],
]);

const STRING = rule<T2, string>();
STRING.setPattern(
  p.lrec_sc(
    p.apply(p.alt(p.tok(T2.Char), p.tok(T2.Newline)), (c) => c.text),
    p.alt(p.tok(T2.Char), p.tok(T2.Newline)),
    (c1, c2) => c1 + c2.text
  )
);

const ACTION_GROUP = rule<T2, ActionGroup>();
ACTION_GROUP.setPattern(
  p.apply(
    p.seq(
      p.apply(p.kright(p.tok(T2.KeywordThought), STRING), (str) => str.trim()),
      p.apply(p.kright(p.tok(T2.KeywordAction), STRING), (str) => str.trim()),
      p.opt_sc(
        p.apply(p.kright(p.tok(T2.KeywordResult), p.opt(STRING)), (str) => {
          const result = str != null ? str.trim() : "";
          if (result.length === 0) {
            return undefined;
          }
          return result;
        })
      )
    ),
    ([thought, action, result]) => {
      const expressions = parseStatements(action);
      return {
        thought,
        action,
        result,
        expressions,
      };
    }
  )
);

export function parseActionGroup(expr: string): ActionGroup {
  return expectSingleResult(
    expectEOF(
      ACTION_GROUP.parse(
        // Inject a newline so that the lexer can disambiguate between
        // a leading Thought: vs a Thought: inside some contents.
        actionLexer.parse(expr[0] !== "\n" ? "\n" + expr : expr)
      )
    )
  );
}
