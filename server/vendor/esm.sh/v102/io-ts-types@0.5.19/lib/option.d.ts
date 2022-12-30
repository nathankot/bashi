/**
 * @since 0.5.0
 */
import { Option } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Option/lib/index.d.ts'
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
declare const None: t.ExactC<
  t.TypeC<{
    _tag: t.LiteralC<'None'>
  }>
>
/**
 * @since 0.5.18
 */
export declare type NoneOutput = t.OutputOf<typeof None>
/**
 * @since 0.5.18
 */
export declare type SomeOutput<A> = {
  _tag: 'Some'
  value: A
}
/**
 * @since 0.5.18
 */
export declare type OptionOutput<A> = NoneOutput | SomeOutput<A>
/**
 * Given a codec representing a type `A`, returns a codec representing `Option<A>` that is able to deserialize
 * the JSON representation of an `Option`.
 *
 * @example
 * import { option } from 'io-ts-types/lib/option'
 * import { right } from 'fp-ts/lib/Either'
 * import { none, some } from 'fp-ts/lib/Option'
 * import * as t from 'io-ts'
 * import { PathReporter } from 'io-ts/lib/PathReporter'
 *
 * const T = option(t.number)
 *
 * assert.deepStrictEqual(T.decode(none), right(none))
 * assert.deepStrictEqual(T.decode(some(1)), right(some(1)))
 * assert.deepStrictEqual(PathReporter.report(T.decode(some('a'))), ['Invalid value "a" supplied to : Option<number>/1: Some<number>/value: number'])
 *
 * @since 0.5.0
 */
export interface OptionC<C extends t.Mixed> extends t.Type<Option<t.TypeOf<C>>, OptionOutput<t.OutputOf<C>>, unknown> {}
/**
 * @since 0.5.0
 */
export declare function option<C extends t.Mixed>(codec: C, name?: string): OptionC<C>
export {}