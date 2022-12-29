import { Token, TokenPosition } from './../Lexer.d.ts';
/**
 * A ParseResult has to parts:
 *   result: The result object of this try.
 *   nextToken: The first unconsumed token.
 */
export interface ParseResult<TKind, TResult> {
    readonly firstToken: Token<TKind> | undefined;
    readonly nextToken: Token<TKind> | undefined;
    readonly result: TResult;
}
export interface ParseError {
    readonly kind: 'Error';
    readonly pos: TokenPosition | undefined;
    readonly message: string;
}
/**
 * A ParserOutput always has candidates and an error.
 * If successful===true, it means that the candidates field is valid, even when it is empty.
 * If successful===false, error will be not null
 * The error field stores the farest error that has even been seen, even when tokens are successfully parsed.
 */
export declare type ParserOutput<TKind, TResult> = {
    candidates: ParseResult<TKind, TResult>[];
    successful: true;
    error: ParseError | undefined;
} | {
    successful: false;
    error: ParseError;
};
export interface Parser<TKind, TResult> {
    parse(token: Token<TKind> | undefined): ParserOutput<TKind, TResult>;
}
export declare function betterError(e1: ParseError | undefined, e2: ParseError | undefined): ParseError | undefined;
export declare function resultOrError<TKind, TResult>(result: ParseResult<TKind, TResult>[], error: ParseError | undefined, successful: boolean): ParserOutput<TKind, TResult>;
export declare function unableToConsumeToken<TKind>(token: Token<TKind> | undefined): ParseError;
