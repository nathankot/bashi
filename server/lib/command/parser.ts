import * as t from "io-ts";
import * as p from "typescript-parsec";

import { strUntil } from "./parser_until.ts";

import {
  buildLexer,
  rule,
  expectEOF,
  expectSingleResult,
} from "typescript-parsec";

import { Value, StringValue } from "@lib/valueTypes.ts";

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

export enum T {
  Identifier,

  TrueLiteral,
  FalseLiteral,
  NumberLiteral,
  SingleQuoteStringLiteral,
  DoubleQuoteStringLiteral,

  KeywordConst,
  KeywordLet,
  KeywordVar,

  BackQuote,
  Dollar,
  Equals,
  Plus,
  LParen,
  RParen,
  LCurly,
  RCurly,
  Space,
  Comma,
  SemiColon,

  EscapedChar,
  Char,
}

export const lexer = buildLexer([
  [true, /^'([^'\\]|\\.)*'/g, T.SingleQuoteStringLiteral],
  [true, /^"([^"\\]|\\.)*"/g, T.DoubleQuoteStringLiteral],
  [true, /^[\+\-]?\d+(\.\d+)?/g, T.NumberLiteral],
  [true, /^true/g, T.TrueLiteral],
  [true, /^false/g, T.FalseLiteral],
  [true, /^const/g, T.KeywordConst],
  [true, /^let/g, T.KeywordLet],
  [true, /^var/g, T.KeywordVar],

  [true, /^[a-zA-Z_-][a-zA-Z0-9_-]*/g, T.Identifier],

  [true, /^`/g, T.BackQuote],
  [true, /^\+/g, T.Plus],
  [true, /^=/g, T.Equals],
  [true, /^\(/g, T.LParen],
  [true, /^\)/g, T.RParen],
  [true, /^\$/g, T.Dollar],
  [true, /^{/g, T.LCurly],
  [true, /^}/g, T.RCurly],
  [true, /^\,/g, T.Comma],
  [true, /^;/g, T.SemiColon],

  [true, /^\s/g, T.Space],
  [true, /^\\./g, T.EscapedChar],
  [true, /^./g, T.Char],
]);

const FUNC_CALL = rule<T, Call>();
const INFIX_CALL = rule<T, Expr>();
const PAREN_GROUP = rule<T, Expr>();
const VALUE = rule<T, Value>();
const VAR_REF = rule<T, Call>();
export const TEMPLATE_STRING = rule<T, Expr>();

export const EXPR = p.alt(
  VALUE,
  TEMPLATE_STRING,
  FUNC_CALL,
  INFIX_CALL,
  PAREN_GROUP,
  VAR_REF
);
const EXPR_WITHOUT_INFIX_CALL = p.alt(
  VALUE,
  FUNC_CALL,
  TEMPLATE_STRING,
  PAREN_GROUP,
  VAR_REF
);
export const STATEMENT = rule<T, Expr>();
export const STATEMENTS = rule<T, Expr[]>();

const ANY_SPACE = p.rep_sc(p.tok(T.Space));

PAREN_GROUP.setPattern(p.kmid(p.tok(T.LParen), EXPR, p.tok(T.RParen)));

VALUE.setPattern(
  p.apply(
    p.alt(
      p.tok(T.TrueLiteral),
      p.tok(T.FalseLiteral),
      p.tok(T.NumberLiteral),
      p.tok(T.SingleQuoteStringLiteral),
      p.tok(T.DoubleQuoteStringLiteral)
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
        default:
          const exhaustiveCheck: never = tok;
          throw new Error(
            `Unsupported value kind: ${(exhaustiveCheck as any).text}`
          );
      }
    }
  )
);

TEMPLATE_STRING.setPattern(
  p.apply(
    p.kmid(
      p.tok(T.BackQuote),
      p.rep(
        p.alt(
          p.kmid(
            p.seq(p.tok(T.Dollar), p.tok(T.LCurly), ANY_SPACE),
            EXPR,
            p.seq(ANY_SPACE, p.tok(T.RCurly))
          ),
          p.apply(
            strUntil(["$", "`"], ["$", "`"]),
            (value): StringValue => ({
              type: "string",
              value,
            })
          )
        )
      ),
      p.tok(T.BackQuote)
    ),
    (exprs: Expr[]) =>
      exprs.reduce(
        (a, e) =>
          a.type === "string" && e.type === "string"
            ? { type: "string", value: a.value + e.value }
            : {
                type: "call",
                name: "__+__",
                args: [a, e],
              },
        { type: "string", value: "" }
      )
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
      ANY_SPACE,
      p.opt_sc(
        p.kleft(
          p.list_sc(EXPR, p.seq(ANY_SPACE, p.tok(T.Comma), ANY_SPACE)),
          p.opt_sc(p.seq(ANY_SPACE, p.tok(T.Comma), ANY_SPACE))
        )
      ),
      ANY_SPACE,
      p.tok(T.RParen)
    ),
    ([{ text: name }, , , maybeArgs]) => ({
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
      p.alt(
        // statements delimited by semicolons:
        p.seq(
          ANY_SPACE,
          p.tok(T.SemiColon),
          ANY_SPACE,
          p.rep_sc(p.tok(T.SemiColon)),
          ANY_SPACE
        ),
        // statements delimited by newlines:
        p.seq(
          p.rep_sc(p.str(" ")),
          p.str("\n"),
          p.rep_sc(p.str(" ")),
          p.rep_sc(p.str("\n")),
          p.rep_sc(p.str(" "))
        )
      )
    ),
    p.opt_sc(
      p.seq(ANY_SPACE, p.seq(p.tok(T.SemiColon), p.rep_sc(p.tok(T.SemiColon))))
    )
  )
);

export function parseExpression(str: string): Expr {
  return expectSingleResult(
    expectEOF(p.kmid(ANY_SPACE, EXPR, ANY_SPACE).parse(lexer.parse(str)))
  );
}

export function parseStatements(str: string): Expr[] {
  if (str.trim() === "") {
    return [];
  }
  return expectSingleResult(
    expectEOF(p.kmid(ANY_SPACE, STATEMENTS, ANY_SPACE).parse(lexer.parse(str)))
  );
}

export function parseInsensitiveString<T>(
  toMatch: string
): p.Parser<T, p.Token<T>> {
  return {
    parse(token: p.Token<T> | undefined): p.ParserOutput<T, p.Token<T>> {
      if (
        token === undefined ||
        token.text.toLowerCase() !== toMatch.toLowerCase()
      ) {
        return {
          successful: false,
          error: p.unableToConsumeToken(token),
        };
      }
      return {
        candidates: [
          {
            firstToken: token,
            nextToken: token.next,
            result: token,
          },
        ],
        successful: true,
        error: undefined,
      };
    },
  };
}

export function parseRegexp<T>(toMatch: RegExp): p.Parser<T, p.Token<T>> {
  return {
    parse(token: p.Token<T> | undefined): p.ParserOutput<T, p.Token<T>> {
      if (token === undefined || !toMatch.test(token.text)) {
        return {
          successful: false,
          error: p.unableToConsumeToken(token),
        };
      }
      return {
        candidates: [
          {
            firstToken: token,
            nextToken: token.next,
            result: token,
          },
        ],
        successful: true,
        error: undefined,
      };
    },
  };
}
