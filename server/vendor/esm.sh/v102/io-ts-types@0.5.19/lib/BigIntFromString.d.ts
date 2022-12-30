/**
 * @since 0.5.11
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.11
 */
export interface BigIntFromStringC extends t.Type<bigint, string, unknown> {}
/**
 * @example
 * import { BigIntFromString } from 'io-ts-types/lib/BigIntFromString'
 * import { right } from 'fp-ts/lib/Either'
 * import { PathReporter } from 'io-ts/lib/PathReporter'
 *
 * assert.deepStrictEqual(BigIntFromString.decode('1'), right(BigInt(1)))
 * assert.deepStrictEqual(PathReporter.report(BigIntFromString.decode('1.1')), ['Invalid value "1.1" supplied to : BigIntFromString'])
 * assert.deepStrictEqual(PathReporter.report(BigIntFromString.decode('')), ['Invalid value "" supplied to : BigIntFromString'])
 * assert.deepStrictEqual(PathReporter.report(BigIntFromString.decode(' ')), ['Invalid value " " supplied to : BigIntFromString'])
 *
 * @since 0.5.11
 */
export declare const BigIntFromString: BigIntFromStringC