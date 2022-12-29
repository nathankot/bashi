import * as O from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Option/lib/index.d.ts'
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.0
 */
export interface OptionFromNullableC<C extends t.Mixed>
  extends t.Type<O.Option<t.TypeOf<C>>, t.OutputOf<C> | null, unknown> {}
/**
 * @since 0.5.0
 */
export declare function optionFromNullable<C extends t.Mixed>(codec: C, name?: string): OptionFromNullableC<C>
