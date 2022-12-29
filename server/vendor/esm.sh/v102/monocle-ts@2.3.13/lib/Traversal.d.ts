/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * A `Traversal` is the generalisation of an `Optional` to several targets. In other word, a `Traversal` allows to focus
 * from a type `S` into `0` to `n` values of type `A`.
 *
 * The most common example of a `Traversal` would be to focus into all elements inside of a container (e.g.
 * `ReadonlyArray`, `Option`). To do this we will use the relation between the typeclass `Traversable` and `Traversal`.
 *
 * @since 2.3.0
 */
import { Applicative, Applicative1, Applicative2, Applicative2C, Applicative3 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Applicative/lib/index.d.ts'
import { Category2 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Category/lib/index.d.ts'
import { Either } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Either/lib/index.d.ts'
import { Predicate, Refinement } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/function/lib/index.d.ts'
import { HKT, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/HKT/lib/index.d.ts'
import { Monoid } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Monoid/lib/index.d.ts'
import { Option } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Option/lib/index.d.ts'
import { ReadonlyNonEmptyArray } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/ReadonlyNonEmptyArray/lib/index.d.ts'
import { ReadonlyRecord } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/ReadonlyRecord/lib/index.d.ts'
import { Semigroupoid2 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Semigroupoid/lib/index.d.ts'
import { Traversable, Traversable1, Traversable2, Traversable3 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Traversable/lib/index.d.ts'
import { Iso } from './Iso.d.ts'
import { Lens } from './Lens.d.ts'
import { Optional } from './Optional.d.ts'
import { Prism } from './Prism.d.ts'
/**
 * @category model
 * @since 2.3.0
 */
export interface ModifyF<S, A> {
  <F extends URIS3>(F: Applicative3<F>): <R, E>(f: (a: A) => Kind3<F, R, E, A>) => (s: S) => Kind3<F, R, E, S>
  <F extends URIS2>(F: Applicative2<F>): <E>(f: (a: A) => Kind2<F, E, A>) => (s: S) => Kind2<F, E, S>
  <F extends URIS2, E>(F: Applicative2C<F, E>): (f: (a: A) => Kind2<F, E, A>) => (s: S) => Kind2<F, E, S>
  <F extends URIS>(F: Applicative1<F>): (f: (a: A) => Kind<F, A>) => (s: S) => Kind<F, S>
  <F>(F: Applicative<F>): (f: (a: A) => HKT<F, A>) => (s: S) => HKT<F, S>
}
/**
 * @category model
 * @since 2.3.0
 */
export interface Traversal<S, A> {
  readonly modifyF: ModifyF<S, A>
}
/**
 * @category constructors
 * @since 2.3.8
 */
export declare const traversal: <S, A>(modifyF: Traversal<S, A>['modifyF']) => Traversal<S, A>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const id: <S>() => Traversal<S, S>
/**
 * Create a `Traversal` from a `Traversable`.
 *
 * @category constructor
 * @since 2.3.0
 */
export declare const fromTraversable: {
  <T extends URIS3>(T: Traversable3<T>): <R, E, A>() => Traversal<Kind3<T, R, E, A>, A>
  <T extends URIS2>(T: Traversable2<T>): <E, A>() => Traversal<Kind2<T, E, A>, A>
  <T extends URIS>(T: Traversable1<T>): <A>() => Traversal<Kind<T, A>, A>
  <T>(T: Traversable<T>): <A>() => Traversal<HKT<T, A>, A>
}
/**
 * Compose a `Traversal` with a `Traversal`.
 *
 * @category compositions
 * @since 2.3.0
 */
export declare const compose: <A, B>(ab: Traversal<A, B>) => <S>(sa: Traversal<S, A>) => Traversal<S, B>
/**
 * Alias of `compose`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeTraversal: <A, B>(ab: Traversal<A, B>) => <S>(sa: Traversal<S, A>) => Traversal<S, B>
/**
 * Compose a `Traversal` with a `Iso`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeIso: <A, B>(ab: Iso<A, B>) => <S>(sa: Traversal<S, A>) => Traversal<S, B>
/**
 * Compose a `Traversal` with a `Lens`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeLens: <A, B>(ab: Lens<A, B>) => <S>(sa: Traversal<S, A>) => Traversal<S, B>
/**
 * Compose a `Traversal` with a `Prism`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composePrism: <A, B>(ab: Prism<A, B>) => <S>(sa: Traversal<S, A>) => Traversal<S, B>
/**
 * Compose a `Traversal` with a `Optional`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeOptional: <A, B>(ab: Optional<A, B>) => <S>(sa: Traversal<S, A>) => Traversal<S, B>
/**
 * @category combinators
 * @since 2.3.0
 */
export declare const modify: <A, B extends A = A>(f: (a: A) => B) => <S>(sa: Traversal<S, A>) => (s: S) => S
/**
 * @category combinators
 * @since 2.3.0
 */
export declare const set: <A>(a: A) => <S>(sa: Traversal<S, A>) => (s: S) => S
/**
 * Return a `Traversal` from a `Traversal` focused on a nullable value.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const fromNullable: <S, A>(sa: Traversal<S, A>) => Traversal<S, NonNullable<A>>
/**
 * @category combinators
 * @since 2.3.0
 */
export declare function filter<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Traversal<S, A>) => Traversal<S, B>
export declare function filter<A>(predicate: Predicate<A>): <S>(sa: Traversal<S, A>) => Traversal<S, A>
/**
 * Return a `Traversal` from a `Traversal` and a prop.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const prop: <A, P extends keyof A>(prop: P) => <S>(sa: Traversal<S, A>) => Traversal<S, A[P]>
/**
 * Return a `Traversal` from a `Traversal` and a list of props.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const props: <A, P extends keyof A>(
  props_0: P,
  props_1: P,
  ...props_2: P[]
) => <S>(sa: Traversal<S, A>) => Traversal<S, { [K in P]: A[K] }>
/**
 * Return a `Traversal` from a `Traversal` focused on a component of a tuple.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const component: <A extends readonly unknown[], P extends keyof A>(
  prop: P
) => <S>(sa: Traversal<S, A>) => Traversal<S, A[P]>
/**
 * Return a `Traversal` from a `Traversal` focused on an index of a `ReadonlyArray`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const index: (i: number) => <S, A>(sa: Traversal<S, readonly A[]>) => Traversal<S, A>
/**
 * @category combinators
 * @since 2.3.8
 */
export declare const indexNonEmpty: (i: number) => <S, A>(sa: Traversal<S, ReadonlyNonEmptyArray<A>>) => Traversal<S, A>
/**
 * Return a `Traversal` from a `Traversal` focused on a key of a `ReadonlyRecord`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const key: (key: string) => <S, A>(sa: Traversal<S, Readonly<Record<string, A>>>) => Traversal<S, A>
/**
 * Return a `Traversal` from a `Traversal` focused on a required key of a `ReadonlyRecord`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const atKey: (
  key: string
) => <S, A>(sa: Traversal<S, Readonly<Record<string, A>>>) => Traversal<S, Option<A>>
/**
 * Return a `Traversal` from a `Traversal` focused on the `Some` of a `Option` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const some: <S, A>(soa: Traversal<S, Option<A>>) => Traversal<S, A>
/**
 * Return a `Traversal` from a `Traversal` focused on the `Right` of a `Either` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const right: <S, E, A>(sea: Traversal<S, Either<E, A>>) => Traversal<S, A>
/**
 * Return a `Traversal` from a `Traversal` focused on the `Left` of a `Either` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const left: <S, E, A>(sea: Traversal<S, Either<E, A>>) => Traversal<S, E>
/**
 * Return a `Traversal` from a `Traversal` focused on a `Traversable`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const traverse: <T extends URIS>(
  T: Traversable1<T>
) => <S, A>(sta: Traversal<S, Kind<T, A>>) => Traversal<S, A>
/**
 * @category combinators
 * @since 2.3.8
 */
export declare function findFirst<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Traversal<S, ReadonlyArray<A>>) => Traversal<S, B>
export declare function findFirst<A>(
  predicate: Predicate<A>
): <S>(sa: Traversal<S, ReadonlyArray<A>>) => Traversal<S, A>
/**
 * @category combinators
 * @since 2.3.8
 */
export declare function findFirstNonEmpty<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Traversal<S, ReadonlyNonEmptyArray<A>>) => Traversal<S, B>
export declare function findFirstNonEmpty<A>(
  predicate: Predicate<A>
): <S>(sa: Traversal<S, ReadonlyNonEmptyArray<A>>) => Traversal<S, A>
/**
 * Map each target to a `Monoid` and combine the results.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => <S>(sa: Traversal<S, A>) => (s: S) => M
/**
 * Map each target to a `Monoid` and combine the results.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const fold: <A>(M: Monoid<A>) => <S>(sa: Traversal<S, A>) => (s: S) => A
/**
 * Get all the targets of a `Traversal`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const getAll: <S>(s: S) => <A>(sa: Traversal<S, A>) => readonly A[]
/**
 * @category instances
 * @since 2.3.0
 */
export declare const URI = 'monocle-ts/Traversal'
/**
 * @category instances
 * @since 2.3.0
 */
export declare type URI = typeof URI
declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: Traversal<E, A>
  }
}
/**
 * @category instances
 * @since 2.3.8
 */
export declare const Semigroupoid: Semigroupoid2<URI>
/**
 * @category instances
 * @since 2.3.0
 */
export declare const Category: Category2<URI>
