/**
 * @since 0.5.0
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.0
 */
export interface NumberFromStringC extends t.Type<number, string, unknown> {}
/**
 * @example
 * import { NumberFromString } from 'io-ts-types/lib/NumberFromString'
 *
 * NumberFromString.decode('1') // right(1)
 * NumberFromString.decode('1.1') // right(1.1)
 *
 * @since 0.5.0
 */
export declare const NumberFromString: NumberFromStringC
