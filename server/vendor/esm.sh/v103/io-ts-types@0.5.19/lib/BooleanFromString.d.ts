/**
 * @since 0.5.0
 */
import * as t from 'https://esm.sh/v103/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.0
 */
export interface BooleanFromStringC extends t.Type<boolean, string, unknown> {}
/**
 * @example
 * import { BooleanFromString } from 'io-ts-types/lib/BooleanFromString'
 * import { right } from 'fp-ts/lib/Either'
 * import { PathReporter } from 'io-ts/lib/PathReporter'
 *
 * assert.deepStrictEqual(BooleanFromString.decode('true'), right(true))
 * assert.deepStrictEqual(BooleanFromString.decode('false'), right(false))
 * assert.deepStrictEqual(PathReporter.report(BooleanFromString.decode('a')), ['Invalid value "a" supplied to : BooleanFromString'])
 *
 * @since 0.5.0
 */
export declare const BooleanFromString: BooleanFromStringC