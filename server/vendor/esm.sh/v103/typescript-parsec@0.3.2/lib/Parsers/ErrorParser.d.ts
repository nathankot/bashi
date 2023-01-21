import { Parser } from './ParserInterface.d.ts';
export declare function err<TKind, TResult>(p: Parser<TKind, TResult>, errorMessage: string): Parser<TKind, TResult>;
export declare function errd<TKind, TResult>(p: Parser<TKind, TResult>, errorMessage: string, defaultValue: TResult): Parser<TKind, TResult>;
