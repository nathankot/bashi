/**
 * @since 0.4.4
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.4.4
 */
export interface RegExpC extends t.Type<RegExp, RegExp, unknown> {}
/**
 * @example
 * import { regexp } from 'io-ts-types/lib/regexp'
 * import { right } from 'fp-ts/lib/Either'
 *
 * const input1 = /\w+/
 * const input2 = new RegExp('\\w+')
 * assert.deepStrictEqual(regexp.decode(input1), right(input1))
 * assert.deepStrictEqual(regexp.decode(input2), right(input2))
 *
 * @since 0.4.4
 */
export declare const regexp: RegExpC
