import { Parser, Token } from "typescript-parsec";

// parse string until the given stop, accounting for certain
// characters that are escaped.
export function strUntil<TKind, TResult>(
  stops: string[],
  escapes: string[] = []
): Parser<TKind, string> {
  return {
    parse(token: Token<TKind> | undefined) {
      const firstToken = token;
      let nextToken = token;
      let result = "";
      while (true) {
        if (nextToken == null) {
          break;
        }
        if (stops.includes(nextToken.text)) {
          break;
        }
        if (
          nextToken.text.length === 2 &&
          nextToken.text[0] === "\\" &&
          escapes.includes(nextToken.text[1] ?? "")
        ) {
          result = result + (nextToken.text[1] ?? "");
        } else {
          result = result + nextToken.text;
        }
        nextToken = nextToken.next;
      }
      return {
        error: undefined,
        successful: true,
        candidates: [
          {
            firstToken,
            nextToken,
            result,
          },
        ],
      };
    },
  };
}
