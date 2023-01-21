/**
 * @since 0.4.4
 */
import * as t from 'https://esm.sh/v103/io-ts@2.2.20/lib/index.d.ts'
/**
 * Returns a codec from a refinement
 *
 * @since 0.4.4
 */
export declare function fromRefinement<A>(name: string, is: (u: unknown) => u is A): t.Type<A, A, unknown>
