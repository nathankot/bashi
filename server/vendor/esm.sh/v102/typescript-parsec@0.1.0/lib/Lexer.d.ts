export interface TokenPosition {
    readonly index: number;
    readonly rowBegin: number;
    readonly columnBegin: number;
    readonly rowEnd: number;
    readonly columnEnd: number;
}
export interface Token<T> {
    readonly kind: T;
    readonly text: string;
    readonly pos: TokenPosition;
    readonly next: Token<T> | undefined;
}
export interface Lexer<T> {
    parse(input: string): Token<T> | undefined;
}
export declare class TokenError extends Error {
    pos: TokenPosition | undefined;
    errorMessage: string;
    constructor(pos: TokenPosition | undefined, errorMessage: string);
}
export declare function buildLexer<T>(rules: [boolean, RegExp, T][]): Lexer<T>;
