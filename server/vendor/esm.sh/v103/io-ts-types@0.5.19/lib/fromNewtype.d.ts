/**
 * @since 0.5.2
 */
import { AnyNewtype, CarrierOf } from 'https://esm.sh/v103/newtype-ts@0.3.5/lib/index.d.ts'
import * as t from 'https://esm.sh/v103/io-ts@2.2.20/lib/index.d.ts'
/**
 * Returns a codec from a newtype
 *
 * @example
 * import { fromNewtype } from 'io-ts-types/lib/fromNewtype'
 * import * as t from 'io-ts'
 * import { right } from 'fp-ts/lib/Either'
 * import { PathReporter } from 'io-ts/lib/PathReporter'
 * import { Newtype, iso } from 'newtype-ts'
 *
 * interface Token extends Newtype<{ readonly Token: unique symbol }, string> {}
 *
 * const T = fromNewtype<Token>(t.string)
 *
 * assert.deepStrictEqual(T.decode('sometoken'), right(iso<Token>().wrap('sometoken')))
 * assert.deepStrictEqual(PathReporter.report(T.decode(42)), ['Invalid value 42 supplied to : fromNewtype(string)'])
 *
 * @since 0.5.2
 */
export declare function fromNewtype<N extends AnyNewtype = never>(
  codec: t.Type<CarrierOf<N>, t.OutputOf<CarrierOf<N>>>,
  name?: string
): t.Type<N, CarrierOf<N>, unknown>
