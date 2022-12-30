/**
 * @since 0.5.0
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.0
 */
export interface DateFromNumberC extends t.Type<Date, number, unknown> {}
/**
 * @example
 * import { DateFromNumber } from 'io-ts-types/lib/DateFromNumber'
 * import { right } from 'fp-ts/lib/Either'
 *
 * const date = new Date(1973, 10, 30)
 * const input = date.getTime()
 * assert.deepStrictEqual(DateFromNumber.decode(input), right(date))
 *
 * @since 0.5.0
 */
export declare const DateFromNumber: DateFromNumberC