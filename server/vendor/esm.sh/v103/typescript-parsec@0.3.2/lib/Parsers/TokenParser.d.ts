import { Token } from '../Lexer.d.ts';
import { Parser } from './ParserInterface.d.ts';
export declare function nil<T>(): Parser<T, undefined>;
export declare function str<T>(toMatch: string): Parser<T, Token<T>>;
export declare function tok<T>(toMatch: T): Parser<T, Token<T>>;
