import { Token } from '../Lexer.d.ts';
import { Parser } from './ParserInterface.d.ts';
export declare function apply<TKind, TFrom, TTo>(p: Parser<TKind, TFrom>, callback: (value: TFrom, tokenRange: [Token<TKind> | undefined, Token<TKind> | undefined]) => TTo): Parser<TKind, TTo>;
export declare function kleft<TKind, T1, T2>(p1: Parser<TKind, T1>, p2: Parser<TKind, T2>): Parser<TKind, T1>;
export declare function kright<TKind, T1, T2>(p1: Parser<TKind, T1>, p2: Parser<TKind, T2>): Parser<TKind, T2>;
export declare function kmid<TKind, T1, T2, T3>(p1: Parser<TKind, T1>, p2: Parser<TKind, T2>, p3: Parser<TKind, T3>): Parser<TKind, T2>;
