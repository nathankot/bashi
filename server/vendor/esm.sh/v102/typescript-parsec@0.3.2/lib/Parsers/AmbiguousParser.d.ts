import { Parser } from './ParserInterface.d.ts';
export declare function amb<TKind, TResult>(p: Parser<TKind, TResult>): Parser<TKind, TResult[]>;
