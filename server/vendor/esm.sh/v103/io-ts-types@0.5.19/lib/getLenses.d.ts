/**
 * @since 0.5.0
 */
import * as t from 'https://esm.sh/v103/io-ts@2.2.20/lib/index.d.ts'
import { Lens } from 'https://esm.sh/v103/monocle-ts@2.3.13/lib/index.d.ts'
/**
 * @since 0.5.0
 */
export interface ExactHasLenses extends t.ExactType<HasLenses> {}
/**
 * @since 0.5.0
 */
export declare type HasLenses = t.InterfaceType<any> | ExactHasLenses
/**
 * Return a `Lens` for each prop
 *
 * @example
 * import * as t from 'io-ts'
 * import { getLenses } from 'io-ts-types/lib/getLenses'
 *
 * const Person = t.type({
 *   name: t.string,
 *   age: t.number
 * })
 *
 * const lenses = getLenses(Person)
 * assert.strictEqual(lenses.age.get({ name: 'Giulio', age: 44 }), 44)
 *
 * @since 0.5.0
 */
export declare function getLenses<C extends HasLenses>(
  codec: C
): {
  [K in keyof t.TypeOf<C>]: Lens<t.TypeOf<C>, t.TypeOf<C>[K]>
}
