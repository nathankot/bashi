/**
 * @since 0.5.13
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.13
 */
export interface BooleanFromNumberC extends t.Type<boolean, number, unknown> {}
/**
 * @example
 * import { BooleanFromNumber } from 'io-ts-types/lib/BooleanFromNumber'
 * import { right } from 'fp-ts/lib/Either'
 * import { PathReporter } from 'io-ts/lib/PathReporter'
 *
 * assert.deepStrictEqual(BooleanFromNumber.decode(1), right(true))
 * assert.deepStrictEqual(BooleanFromNumber.decode(0), right(false))
 * assert.deepStrictEqual(BooleanFromNumber.decode(123), right(true))
 * assert.deepStrictEqual(PathReporter.report(BooleanFromNumber.decode('a')), ['Invalid value "a" supplied to : BooleanFromNumber'])
 *
 * @since 0.5.13
 */
export declare const BooleanFromNumber: BooleanFromNumberC
