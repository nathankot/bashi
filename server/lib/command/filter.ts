import * as p from "typescript-parsec";

import {
  buildLexer,
  rule,
  expectEOF,
  expectSingleResult,
} from "typescript-parsec";

import { CommandSet } from "./types.ts";

enum TokenKind {
  Word,
  Space,
  StopWord,
  Other,
}

const stopWords = {
  i: null,
  me: null,
  my: null,
  myself: null,
  we: null,
  our: null,
  ours: null,
  ourselves: null,
  you: null,
  your: null,
  yours: null,
  yourself: null,
  yourselves: null,
  he: null,
  him: null,
  his: null,
  himself: null,
  she: null,
  her: null,
  hers: null,
  herself: null,
  it: null,
  its: null,
  itself: null,
  they: null,
  them: null,
  their: null,
  theirs: null,
  themselves: null,
  what: null,
  which: null,
  who: null,
  whom: null,
  this: null,
  that: null,
  these: null,
  those: null,
  am: null,
  is: null,
  are: null,
  was: null,
  were: null,
  be: null,
  been: null,
  being: null,
  have: null,
  has: null,
  had: null,
  having: null,
  do: null,
  does: null,
  did: null,
  doing: null,
  a: null,
  an: null,
  the: null,
  and: null,
  but: null,
  if: null,
  or: null,
  because: null,
  as: null,
  until: null,
  while: null,
  of: null,
  at: null,
  by: null,
  for: null,
  with: null,
  about: null,
  against: null,
  between: null,
  into: null,
  through: null,
  during: null,
  before: null,
  after: null,
  above: null,
  below: null,
  to: null,
  from: null,
  up: null,
  down: null,
  in: null,
  out: null,
  on: null,
  off: null,
  over: null,
  under: null,
  again: null,
  further: null,
  then: null,
  once: null,
  here: null,
  there: null,
  when: null,
  where: null,
  why: null,
  how: null,
  all: null,
  any: null,
  both: null,
  each: null,
  few: null,
  more: null,
  most: null,
  other: null,
  some: null,
  such: null,
  no: null,
  nor: null,
  not: null,
  only: null,
  own: null,
  same: null,
  so: null,
  than: null,
  too: null,
  very: null,
  s: null,
  t: null,
  can: null,
  will: null,
  just: null,
  don: null,
  should: null,
  now: null,
};

const lexer = buildLexer([
  [
    false,
    new RegExp(`^(${Object.keys(stopWords).join("|")})`, "g"),
    TokenKind.StopWord,
  ],
  [true, /^[A-z'-]*/g, TokenKind.Word],
  [false, /^\s+/g, TokenKind.Space],
  [false, /^[^A-z'-]*/g, TokenKind.Other],
]);

const WORDS = rule<TokenKind, Record<string, true>>();
WORDS.setPattern(
  p.apply(p.rep_sc(p.tok(TokenKind.Word)), (toks) => {
    let result: Record<string, true> = {};
    for (const tok of toks) {
      result[tok.text.toLowerCase()] = true;
    }
    return result;
  })
);

export function parseWordsFromRequest(request: string): Record<string, true> {
  return expectSingleResult(expectEOF(WORDS.parse(lexer.parse(request))));
}

export function filterUnnecessary(
  request: string,
  commandSet: CommandSet
): CommandSet {
  const result: CommandSet = {};
  const words = parseWordsFromRequest(request);
  commandLoop: for (const [k, c] of Object.entries(commandSet)) {
    if ("disable" in c && c.disable === true) {
      continue commandLoop;
    }
    if (c.triggerTokens == null || c.triggerTokens.length === 0) {
      result[k] = c;
      continue commandLoop;
    }
    for (const trigger of c.triggerTokens) {
      if (words[trigger.toLowerCase()] === true) {
        result[k] = c;
        continue commandLoop;
      }
    }
  }
  return result;
}
