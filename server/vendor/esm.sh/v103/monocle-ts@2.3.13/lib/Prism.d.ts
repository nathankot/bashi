/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * A `Prism` is an optic used to select part of a sum type.
 *
 * Laws:
 *
 * 1. `pipe(getOption(s), fold(() => s, reverseGet)) = s`
 * 2. `getOption(reverseGet(a)) = some(a)`
 *
 * @since 2.3.0
 */
import { Applicative, Applicative1, Applicative2, Applicative3 } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Applicative/lib/index.d.ts'
import { Category2 } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Category/lib/index.d.ts'
import { Either } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Either/lib/index.d.ts'
import { Predicate, Refinement } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/function/lib/index.d.ts'
import { HKT, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/HKT/lib/index.d.ts'
import { Invariant2 } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Invariant/lib/index.d.ts'
import * as O from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Option/lib/index.d.ts'
import { ReadonlyNonEmptyArray } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/ReadonlyNonEmptyArray/lib/index.d.ts'
import { ReadonlyRecord } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/ReadonlyRecord/lib/index.d.ts'
import { Semigroupoid2 } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Semigroupoid/lib/index.d.ts'
import { Traversable1 } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Traversable/lib/index.d.ts'
import { Iso } from './Iso.d.ts'
import { Lens } from './Lens.d.ts'
import { Optional } from './Optional.d.ts'
import { Traversal } from './Traversal.d.ts'
import Option = O.Option
/**
 * @category model
 * @since 2.3.0
 */
export interface Prism<S, A> {
  readonly getOption: (s: S) => Option<A>
  readonly reverseGet: (a: A) => S
}
/**
 * @category constructors
 * @since 2.3.8
 */
export declare const prism: <S, A>(
  getOption: Prism<S, A>['getOption'],
  reverseGet: Prism<S, A>['reverseGet']
) => Prism<S, A>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const id: <S>() => Prism<S, S>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const fromPredicate: {
  <S, A extends S>(refinement: Refinement<S, A>): Prism<S, A>
  <A>(predicate: Predicate<A>): Prism<A, A>
}
/**
 * View a `Prism` as a `Optional`.
 *
 * @category converters
 * @since 2.3.0
 */
export declare const asOptional: <S, A>(sa: Prism<S, A>) => Optional<S, A>
/**
 * View a `Prism` as a `Traversal`.
 *
 * @category converters
 * @since 2.3.0
 */
export declare const asTraversal: <S, A>(sa: Prism<S, A>) => Traversal<S, A>
/**
 * Compose a `Prism` with a `Prism`.
 *
 * @category compositions
 * @since 2.3.0
 */
export declare const compose: <A, B>(ab: Prism<A, B>) => <S>(sa: Prism<S, A>) => Prism<S, B>
/**
 * Alias of `compose`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composePrism: <A, B>(ab: Prism<A, B>) => <S>(sa: Prism<S, A>) => Prism<S, B>
/**
 * Compose a `Prism` with a `Iso`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeIso: <A, B>(ab: Iso<A, B>) => <S>(sa: Prism<S, A>) => Prism<S, B>
/**
 * Compose a `Prism` with a `Lens`.
 *
 * @category compositions
 * @since 2.3.0
 */
export declare const composeLens: <A, B>(ab: Lens<A, B>) => <S>(sa: Prism<S, A>) => Optional<S, B>
/**
 * Compose a `Prism` with an `Optional`.
 *
 * @category compositions
 * @since 2.3.0
 */
export declare const composeOptional: <A, B>(ab: Optional<A, B>) => <S>(sa: Prism<S, A>) => Optional<S, B>
/**
 * Compose a `Prism` with an `Traversal`.
 *
 * @category compositions
 * @since 2.3.8
 */
export declare const composeTraversal: <A, B>(ab: Traversal<A, B>) => <S>(sa: Prism<S, A>) => Traversal<S, B>
/**
 * @category combinators
 * @since 2.3.0
 */
export declare const set: <A>(a: A) => <S>(sa: Prism<S, A>) => (s: S) => S
/**
 * @category combinators
 * @since 2.3.0
 */
export declare const modifyOption: <A, B extends A = A>(f: (a: A) => B) => <S>(sa: Prism<S, A>) => (s: S) => Option<S>
/**
 * @category combinators
 * @since 2.3.0
 */
export declare const modify: <A, B extends A = A>(f: (a: A) => B) => <S>(sa: Prism<S, A>) => (s: S) => S
/**
 * @category combinators
 * @since 2.3.5
 */
export declare function modifyF<F extends URIS3>(
  F: Applicative3<F>
): <A, R, E>(f: (a: A) => Kind3<F, R, E, A>) => <S>(sa: Prism<S, A>) => (s: S) => Kind3<F, R, E, S>
export declare function modifyF<F extends URIS2>(
  F: Applicative2<F>
): <A, E>(f: (a: A) => Kind2<F, E, A>) => <S>(sa: Prism<S, A>) => (s: S) => Kind2<F, E, S>
export declare function modifyF<F extends URIS>(
  F: Applicative1<F>
): <A>(f: (a: A) => Kind<F, A>) => <S>(sa: Prism<S, A>) => (s: S) => Kind<F, S>
export declare function modifyF<F>(
  F: Applicative<F>
): <A>(f: (a: A) => HKT<F, A>) => <S>(sa: Prism<S, A>) => (s: S) => HKT<F, S>
/**
 * Return a `Prism` from a `Prism` focused on a nullable value.
 *
 * @category combinators
 * @since 2.3.3
 */
export declare const fromNullable: <S, A>(sa: Prism<S, A>) => Prism<S, NonNullable<A>>
/**
 * @category combinators
 * @since 2.3.0
 */
export declare function filter<A, B extends A>(refinement: Refinement<A, B>): <S>(sa: Prism<S, A>) => Prism<S, B>
export declare function filter<A>(predicate: Predicate<A>): <S>(sa: Prism<S, A>) => Prism<S, A>
/**
 * Return a `Optional` from a `Prism` and a prop.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const prop: <A, P extends keyof A>(prop: P) => <S>(sa: Prism<S, A>) => Optional<S, A[P]>
/**
 * Return a `Optional` from a `Prism` and a list of props.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const props: <A, P extends keyof A>(
  props_0: P,
  props_1: P,
  ...props_2: P[]
) => <S>(sa: Prism<S, A>) => Optional<S, { [K in P]: A[K] }>
/**
 * Return a `Optional` from a `Prism` focused on a component of a tuple.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const component: <A extends readonly unknown[], P extends keyof A>(
  prop: P
) => <S>(sa: Prism<S, A>) => Optional<S, A[P]>
/**
 * Return a `Optional` from a `Prism` focused on an index of a `ReadonlyArray`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const index: (i: number) => <S, A>(sa: Prism<S, readonly A[]>) => Optional<S, A>
/**
 * Return a `Optional` from a `Prism` focused on an index of a `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 2.3.8
 */
export declare const indexNonEmpty: (i: number) => <S, A>(sa: Prism<S, ReadonlyNonEmptyArray<A>>) => Optional<S, A>
/**
 * Return a `Optional` from a `Prism` focused on a key of a `ReadonlyRecord`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const key: (key: string) => <S, A>(sa: Prism<S, Readonly<Record<string, A>>>) => Optional<S, A>
/**
 * Return a `Optional` from a `Prism` focused on a required key of a `ReadonlyRecord`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const atKey: (
  key: string
) => <S, A>(sa: Prism<S, Readonly<Record<string, A>>>) => Optional<S, O.Option<A>>
/**
 * Return a `Prism` from a `Prism` focused on the `Some` of a `Option` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const some: <S, A>(soa: Prism<S, Option<A>>) => Prism<S, A>
/**
 * Return a `Prism` from a `Prism` focused on the `Right` of a `Either` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const right: <S, E, A>(sea: Prism<S, Either<E, A>>) => Prism<S, A>
/**
 * Return a `Prism` from a `Prism` focused on the `Left` of a `Either` type.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare const left: <S, E, A>(sea: Prism<S, Either<E, A>>) => Prism<S, E>
/**
 * Return a `Traversal` from a `Prism` focused on a `Traversable`.
 *
 * @category combinators
 * @since 2.3.0
 */
export declare function traverse<T extends URIS>(
  T: Traversable1<T>
): <S, A>(sta: Prism<S, Kind<T, A>>) => Traversal<S, A>
/**
 * @category combinators
 * @since 2.3.2
 */
export declare function findFirst<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Prism<S, ReadonlyArray<A>>) => Optional<S, B>
export declare function findFirst<A>(predicate: Predicate<A>): <S>(sa: Prism<S, ReadonlyArray<A>>) => Optional<S, A>
/**
 * @category combinators
 * @since 2.3.8
 */
export declare function findFirstNonEmpty<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Prism<S, ReadonlyNonEmptyArray<A>>) => Optional<S, B>
export declare function findFirstNonEmpty<A>(
  predicate: Predicate<A>
): <S>(sa: Prism<S, ReadonlyNonEmptyArray<A>>) => Optional<S, A>
/**
 * @category Invariant
 * @since 2.3.0
 */
export declare const imap: <A, B>(f: (a: A) => B, g: (b: B) => A) => <E>(sa: Prism<E, A>) => Prism<E, B>
/**
 * @category instances
 * @since 2.3.0
 */
export declare const URI = 'monocle-ts/Prism'
/**
 * @category instances
 * @since 2.3.0
 */
export declare type URI = typeof URI
declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: Prism<E, A>
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