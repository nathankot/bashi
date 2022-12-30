/**
 * @since 0.5.7
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.7
 */
export interface ReadonlyNonEmptyArray<A> extends ReadonlyArray<A> {
  readonly 0: A
}
/**
 * @since 0.5.7
 */
export interface ReadonlyNonEmptyArrayC<C extends t.Mixed>
  extends t.Type<ReadonlyNonEmptyArray<t.TypeOf<C>>, ReadonlyNonEmptyArray<t.OutputOf<C>>, unknown> {}
/**
 * @since 0.5.7
 */
export declare function readonlyNonEmptyArray<C extends t.Mixed>(codec: C, name?: string): ReadonlyNonEmptyArrayC<C>