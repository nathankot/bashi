import { Parser, ParserOutput } from './ParserInterface.d.ts';
export interface Rule<TKind, TResult> extends Parser<TKind, TResult> {
    setPattern(parser: Parser<TKind, TResult>): void;
}
export declare function rule<TKind, TResult>(): Rule<TKind, TResult>;
export declare function expectEOF<TKind, TResult>(output: ParserOutput<TKind, TResult>): ParserOutput<TKind, TResult>;
export declare function expectSingleResult<TKind, TResult>(output: ParserOutput<TKind, TResult>): TResult;
