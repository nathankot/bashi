import { Parser } from './ParserInterface.d.ts';
export declare function opt<TKind, TResult>(p: Parser<TKind, TResult>): Parser<TKind, TResult | undefined>;
export declare function opt_sc<TKind, TResult>(p: Parser<TKind, TResult>): Parser<TKind, TResult | undefined>;
