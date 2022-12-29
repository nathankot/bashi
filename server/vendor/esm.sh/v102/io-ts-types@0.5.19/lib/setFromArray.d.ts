/**
 * @since 0.5.0
 */
import { Ord } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Ord/lib/index.d.ts'
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.0
 */
export interface SetFromArrayC<C extends t.Mixed> extends t.Type<Set<t.TypeOf<C>>, Array<t.OutputOf<C>>, unknown> {}
/**
 * @since 0.5.0
 */
export declare function setFromArray<C extends t.Mixed>(codec: C, O: Ord<t.TypeOf<C>>, name?: string): SetFromArrayC<C>
