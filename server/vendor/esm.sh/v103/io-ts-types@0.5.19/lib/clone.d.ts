/**
 * @since 0.4.3
 */
import * as t from 'https://esm.sh/v103/io-ts@2.2.20/lib/index.d.ts'
/**
 * Returns a clone of the given codec
 *
 * @example
 * import { clone } from 'io-ts-types/lib/clone'
 * import * as t from 'io-ts'
 *
 * assert.deepStrictEqual(clone(t.string), t.string)
 *
 * @since 0.4.3
 */
export declare function clone<C extends t.Any>(t: C): C
