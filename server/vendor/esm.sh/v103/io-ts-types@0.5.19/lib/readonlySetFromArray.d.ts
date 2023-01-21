/**
 * @since 0.5.7
 */
import { Ord } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Ord/lib/index.d.ts'
import * as t from 'https://esm.sh/v103/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.7
 */
export interface ReadonlySetFromArrayC<C extends t.Mixed>
  extends t.Type<ReadonlySet<t.TypeOf<C>>, ReadonlyArray<t.OutputOf<C>>, unknown> {}
/**
 * @since 0.5.7
 */
export declare function readonlySetFromArray<C extends t.Mixed>(
  codec: C,
  O: Ord<t.TypeOf<C>>,
  name?: string
): ReadonlySetFromArrayC<C>
