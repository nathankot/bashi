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

interface Call {
  type: "call";
  name: string;
  args: (Value | Call)[];
}

const Call: t.Type<Call> = t.recursion("Call", () =>
  t.type({
    type: t.literal("call"),
    name: t.string,
    args: t.array(t.union([Value, Call])),
  })
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

enum FunctionTokenKind {
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
  SemiColon,
}

const functionLexer = buildLexer([
  [true, /^'([^'\\]|\\.)*'/g, FunctionTokenKind.SingleQuoteStringLiteral],
  [true, /^"([^"\\]|\\.)*"/g, FunctionTokenKind.DoubleQuoteStringLiteral],
  [true, /^`([^`\\]|\\.)*`/g, FunctionTokenKind.BackQuoteStringLiteral],
  [true, /^[\+\-]?\d+(\.\d+)?/g, FunctionTokenKind.NumberLiteral],
  [true, /^true/g, FunctionTokenKind.TrueLiteral],
  [true, /^false/g, FunctionTokenKind.FalseLiteral],

  [true, /^[a-zA-Z_-][a-zA-Z0-9_-]*/g, FunctionTokenKind.Identifier],

  [true, /^\(/g, FunctionTokenKind.LParen],
  [true, /^\)/g, FunctionTokenKind.RParen],
  [true, /^\,/g, FunctionTokenKind.Comma],
  [true, /^;/g, FunctionTokenKind.SemiColon],
  [false, /^\s+/g, FunctionTokenKind.Space],
]);

const VALUE = rule<FunctionTokenKind, Value>();
VALUE.setPattern(
  p.apply(
    p.alt(
      p.tok(FunctionTokenKind.TrueLiteral),
      p.tok(FunctionTokenKind.FalseLiteral),
      p.tok(FunctionTokenKind.NumberLiteral),
      p.tok(FunctionTokenKind.SingleQuoteStringLiteral),
      p.tok(FunctionTokenKind.DoubleQuoteStringLiteral),
      p.tok(FunctionTokenKind.BackQuoteStringLiteral)
    ),
    (tok) => {
      switch (tok.kind) {
        case FunctionTokenKind.TrueLiteral:
          return { type: "boolean", value: true };
        case FunctionTokenKind.FalseLiteral:
          return { type: "boolean", value: false };
        case FunctionTokenKind.NumberLiteral:
          return { type: "number", value: +tok.text };
        case FunctionTokenKind.SingleQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll(`\\'`, `'`),
          };
        case FunctionTokenKind.DoubleQuoteStringLiteral:
          return {
            type: "string",
            value: tok.text
              .substring(1, tok.text.length - 1)
              .replaceAll(`\\"`, `"`),
          };
        case FunctionTokenKind.BackQuoteStringLiteral:
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

const CALL = rule<FunctionTokenKind, Call>();
CALL.setPattern(
  p.apply(
    p.seq(
      p.tok(FunctionTokenKind.Identifier),
      p.tok(FunctionTokenKind.LParen),
      p.opt_sc(p.list(p.alt(VALUE, CALL), p.tok(FunctionTokenKind.Comma))),
      p.tok(FunctionTokenKind.RParen)
    ),
    ([{ text: name }, , maybeArgs]) => ({
      type: "call",
      name,
      args: maybeArgs ?? [],
    })
  )
);

const CALLS = rule<FunctionTokenKind, Call[]>();
CALLS.setPattern(
  p.apply(
    p.kleft(
      p.list(
        CALL,
        p.seq(
          p.tok(FunctionTokenKind.SemiColon),
          p.rep_sc(p.tok(FunctionTokenKind.SemiColon))
        )
      ),
      p.rep_sc(p.tok(FunctionTokenKind.SemiColon))
    ),
    (calls) => calls
  )
);

export function parseFunctionCall(expr: string): Call {
  return expectSingleResult(expectEOF(CALL.parse(functionLexer.parse(expr))));
}

export function parseFunctionCalls(expr: string): Call[] {
  return expectSingleResult(expectEOF(CALLS.parse(functionLexer.parse(expr))));
}
