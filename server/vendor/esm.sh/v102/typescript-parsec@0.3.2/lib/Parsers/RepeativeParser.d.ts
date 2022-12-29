import { Parser } from './ParserInterface.d.ts';
export declare function rep<TKind, TResult>(p: Parser<TKind, TResult>): Parser<TKind, TResult[]>;
export declare function rep_sc<TKind, TResult>(p: Parser<TKind, TResult>): Parser<TKind, TResult[]>;
export declare function repr<TKind, TResult>(p: Parser<TKind, TResult>): Parser<TKind, TResult[]>;
export declare function list<TKind, TResult, TSeparator>(p: Parser<TKind, TResult>, s: Parser<TKind, TSeparator>): Parser<TKind, TResult[]>;
export declare function list_sc<TKind, TResult, TSeparator>(p: Parser<TKind, TResult>, s: Parser<TKind, TSeparator>): Parser<TKind, TResult[]>;
export declare function lrec<TKind, TResult, TFirst extends TResult, TSecond>(p: Parser<TKind, TFirst>, q: Parser<TKind, TSecond>, callback: (a: TResult, b: TSecond) => TResult): Parser<TKind, TResult>;
export declare function lrec_sc<TKind, TResult, TFirst extends TResult, TSecond>(p: Parser<TKind, TFirst>, q: Parser<TKind, TSecond>, callback: (a: TResult, b: TSecond) => TResult): Parser<TKind, TResult>;
