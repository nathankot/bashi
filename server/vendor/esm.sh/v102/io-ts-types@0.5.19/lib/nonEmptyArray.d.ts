/**
 * @since 0.5.0
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
import { NonEmptyArray } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/NonEmptyArray/lib/index.d.ts'
/**
 * @since 0.5.0
 */
export interface NonEmptyArrayC<C extends t.Mixed>
  extends t.Type<NonEmptyArray<t.TypeOf<C>>, NonEmptyArray<t.OutputOf<C>>, unknown> {}
/**
 * @since 0.5.0
 */
export declare function nonEmptyArray<C extends t.Mixed>(codec: C, name?: string): NonEmptyArrayC<C>
