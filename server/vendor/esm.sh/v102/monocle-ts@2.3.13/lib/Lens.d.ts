/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * A `Lens` is an optic used to zoom inside a product.
 *
 * `Lens`es have two type parameters generally called `S` and `A`: `Lens<S, A>` where `S` represents the product and `A`
 * an element inside of `S`.
 *
 * Laws:
 *
 * 1. `get(set(a)(s)) = a`
 * 2. `set(get(s))(s) = s`
 * 3. `set(a)(set(a)(s)) = set(a)(s)`
 *
 * @since 2.3.0
 */
import { Category2 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Category/lib/index.d.ts'
import { Either } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Either/lib/index.d.ts'
import { Predicate, Refinement } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/function/lib/index.d.ts'
import { Functor, Functor1, Functor2, Functor3 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Functor/lib/index.d.ts'
import { HKT, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/HKT/lib/index.d.ts'
import { Invariant2 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Invariant/lib/index.d.ts'
import { Option } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Option/lib/index.d.ts'
import { ReadonlyNonEmptyArray } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/ReadonlyNonEmptyArray/lib/index.d.ts'
import { ReadonlyRecord } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/ReadonlyRecord/lib/index.d.ts'
import { Semigroupoid2 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Semigroupoid/lib/index.d.ts'
import { Traversable1 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Traversable/lib/index.d.ts'
import { Iso } from './Iso.d.ts'
import { Optional } from './Optional.d.ts'
import { Prism } from './Prism.d.ts'
import { Traversal } from './Traversal.d.ts'
/**
 * @category model
 * @since 2.3.0
 */
export interface Lens<S, A> {
  readonly get: (s: S) => A
  readonly set: (a: A) => (s: S) => S
}
/**
 * @category constructors
 * @since 2.3.8
 */
export declare const lens: <S, A>(get: Lens<S, A>['get'], set: Lens<S, A>['set']) => Lens<S, A>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const id: <S>() => Lens<S, S>
/**
 * View a `Lens` as a `Optional`.
 *
 * @category converters
 * @since 2.3.0
 */
export declare const asOptional: <S, A>(sa: Lens<S, A>) => Optional<S, A>
/**
 * View a `Lens` as a `Traversal`.
 *
 * @category converters
 * @since 2.3.0
 */
export declare const asTraversal: <S, A>(sa: Lens<S, A>) => Traversal<S, A>
/**
 * Compose a `Lens` with a `Lens`.
 *
 * @category compositions
 * @since 2.3.0
 */
export declare const compose: <A, B>(ab: Lens<A, B>) => <S>(sa: Lens<S, A>) => Lens<S, B>
/**
 * Alias of `compose`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeLens: <A, B>(ab: Lens<A, B>) => <S>(sa: Lens<S, A>) => Lens<S, B>
/**
 * Compose a `Lens` with a `Iso`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeIso: <A, B>(ab: Iso<A, B>) => <S>(sa: Lens<S, A>) => Lens<S, B>
/**
 * Compose a `Lens` with a `Prism`.
 *
 * @category compositions
 * @since 2.3.0
 */
export declare const composePrism: <A, B>(ab: Prism<A, B>) => <S>(sa: Lens<S, A>) => Optional<S, B>
/**
 * Compose a `Lens` with an `Optional`.
 *
 * @category compositions
 * @since 2.3.0
 */
export declare const composeOptional: <A, B>(ab: Optional<A, B>) => <S>(sa: Lens<S, A>) => Optional<S, B>
/**
 * Compose a `Lens` with an `Traversal`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeTraversal: <A, B>(ab: Traversal<A, B>) => <S>(sa: Lens<S, A>) => Traversal<S, B>
/**
 * @category combinators
 * @since 2.3.0
 */
export declare const modify: <A, B extends A = A>(f: (a: A) => B) => <S>(sa: Lens<S, A>) => (s: S) => S
/**
 * @category combinators
 * @since 2.3.5
 */
export declare function modifyF<F extends URIS3>(
  F: Functor3<F>
): <A, R, E>(f: (a: A) => Kind3<F, R, E, A>) => <S>(sa: Lens<S, A>) => (s: S) => Kind3<F, R, E, S>
export declare function modifyF<F extends URIS2>(
  F: Functor2<F>
): <A, E>(f: (a: A) => Kind2<F, E, A>) => <S>(sa: Lens<S, A>) => (s: S) => Kind2<F, E, S>
export declare function modifyF<F extends URIS>(
  F: Functor1<F>
): <A>(f: (a: A) => Kind<F, A>) => <S>(sa: Lens<S, A>) => (s: S) => Kind<F, S>
export declare function modifyF<F>(
  F: Functor<F>
): <A>(f: (a: A) => HKT<F, A>) => <S>(sa: Lens<S, A>) => (s: S) => HKT<F, S>
/**
 * Return a `Optional` from a `Lens` focused on a nullable value.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const fromNullable: <S, A>(sa: Lens<S, A>) => Optional<S, NonNullable<A>>
/**
 * @category combinators
 * @since 2.3.0
 */
export declare function filter<A, B extends A>(refinement: Refinement<A, B>): <S>(sa: Lens<S, A>) => Optional<S, B>
export declare function filter<A>(predicate: Predicate<A>): <S>(sa: Lens<S, A>) => Optional<S, A>
/**
 * Return a `Lens` from a `Lens` and a prop.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const prop: <A, P extends keyof A>(prop: P) => <S>(sa: Lens<S, A>) => Lens<S, A[P]>
/**
 * Return a `Lens` from a `Lens` and a list of props.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const props: <A, P extends keyof A>(
  ...props: readonly [P, P, ...ReadonlyArray<P>]
) => <S>(
  sa: Lens<S, A>
) => Lens<
  S,
  {
    [K in P]: A[K]
  }
>
/**
 * Return a `Lens` from a `Lens` focused on a component of a tuple.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const component: <A extends ReadonlyArray<unknown>, P extends keyof A>(
  prop: P
) => <S>(sa: Lens<S, A>) => Lens<S, A[P]>
/**
 * Return a `Optional` from a `Lens` focused on an index of a `ReadonlyArray`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const index: (i: number) => <S, A>(sa: Lens<S, readonly A[]>) => Optional<S, A>
/**
 * Return a `Optional` from a `Lens` focused on an index of a `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 2.3.8
 */
export declare const indexNonEmpty: (i: number) => <S, A>(sa: Lens<S, ReadonlyNonEmptyArray<A>>) => Optional<S, A>
/**
 * Return a `Optional` from a `Lens` focused on a key of a `ReadonlyRecord`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const key: (key: string) => <S, A>(sa: Lens<S, Readonly<Record<string, A>>>) => Optional<S, A>
/**
 * Return a `Lens` from a `Lens` focused on a required key of a `ReadonlyRecord`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const atKey: (key: string) => <S, A>(sa: Lens<S, ReadonlyRecord<string, A>>) => Lens<S, Option<A>>
/**
 * Return a `Optional` from a `Lens` focused on the `Some` of a `Option` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const some: <S, A>(soa: Lens<S, Option<A>>) => Optional<S, A>
/**
 * Return a `Optional` from a `Lens` focused on the `Right` of a `Either` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const right: <S, E, A>(sea: Lens<S, Either<E, A>>) => Optional<S, A>
/**
 * Return a `Optional` from a `Lens` focused on the `Left` of a `Either` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const left: <S, E, A>(sea: Lens<S, Either<E, A>>) => Optional<S, E>
/**
 * Return a `Traversal` from a `Lens` focused on a `Traversable`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare function traverse<T extends URIS>(
  T: Traversable1<T>
): <S, A>(sta: Lens<S, Kind<T, A>>) => Traversal<S, A>
/**
 * @category combinators
 * @since 2.3.2
 */
export declare function findFirst<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Lens<S, ReadonlyArray<A>>) => Optional<S, B>
export declare function findFirst<A>(predicate: Predicate<A>): <S>(sa: Lens<S, ReadonlyArray<A>>) => Optional<S, A>
/**
 * @category combinators
 * @since 2.3.8
 */
export declare function findFirstNonEmpty<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Lens<S, ReadonlyNonEmptyArray<A>>) => Optional<S, B>
export declare function findFirstNonEmpty<A>(
  predicate: Predicate<A>
): <S>(sa: Lens<S, ReadonlyNonEmptyArray<A>>) => Optional<S, A>
/**
 * @category Invariant
 * @since 2.3.0
 */
export declare const imap: <A, B>(f: (a: A) => B, g: (b: B) => A) => <E>(sa: Lens<E, A>) => Lens<E, B>
/**
 * @category instances
 * @since 2.3.0
 */
export declare const URI = 'monocle-ts/Lens'
/**
 * @category instances
 * @since 2.3.0
 */
export declare type URI = typeof URI
declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: Lens<E, A>
  }
}
/**
 * @category instances
 * @since 2.3.0
 */
export declare const Invariant: Invariant2<URI>
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
