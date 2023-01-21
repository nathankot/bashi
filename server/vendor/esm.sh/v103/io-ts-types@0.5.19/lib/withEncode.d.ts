/**
 * @since 0.5.12
 */
import * as t from 'https://esm.sh/v103/io-ts@2.2.20/lib/index.d.ts'
/**
 * Returns a clone of the given codec which uses the given `encode` function
 *
 * @example
 * import { withEncode } from 'io-ts-types/lib/withEncode'
 * import * as t from 'io-ts'
 * import { PathReporter } from 'io-ts/lib/PathReporter'
 * import { right } from 'fp-ts/lib/Either'
 *
 * const T = withEncode(t.number, String)
 *
 * assert.deepStrictEqual(T.decode(1), right(1))
 * assert.deepStrictEqual(T.encode(1), '1')
 * assert.deepStrictEqual(PathReporter.report(T.decode('str')), ['Invalid value "str" supplied to : number'])
 *
 * @since 0.5.12
 */
export declare function withEncode<A, O, I, P>(
  codec: t.Type<A, O, I>,
  encode: (a: A) => P,
  name?: string
): t.Type<A, P, I>