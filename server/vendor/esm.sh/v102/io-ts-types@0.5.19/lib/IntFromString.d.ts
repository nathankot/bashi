/**
 * @since 0.4.4
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.4.4
 */
export interface IntFromStringC extends t.Type<t.Int, string, unknown> {}
/**
 * A codec that succeeds if a string can be parsed to an integer
 *
 * @example
 * import { IntFromString } from 'io-ts-types/lib/IntFromString'
 * import { right } from 'fp-ts/lib/Either'
 * import { PathReporter } from 'io-ts/lib/PathReporter'
 *
 * assert.deepStrictEqual(IntFromString.decode('1'), right(1))
 * assert.deepStrictEqual(PathReporter.report(IntFromString.decode('1.1')), ['Invalid value "1.1" supplied to : IntFromString'])
 *
 * @since 0.4.4
 */
export declare const IntFromString: IntFromStringC