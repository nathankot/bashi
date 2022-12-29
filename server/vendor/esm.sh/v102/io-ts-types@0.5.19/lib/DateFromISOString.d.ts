/**
 * @since 0.5.0
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.0
 */
export interface DateFromISOStringC extends t.Type<Date, string, unknown> {}
/**
 * @example
 * import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
 * import { right } from 'fp-ts/lib/Either'
 *
 * const date = new Date(1973, 10, 30)
 * const input = date.toISOString()
 * assert.deepStrictEqual(DateFromISOString.decode(input), right(date))
 *
 * @since 0.5.0
 */
export declare const DateFromISOString: DateFromISOStringC
