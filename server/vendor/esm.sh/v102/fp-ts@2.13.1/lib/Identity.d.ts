/**
 * @since 2.0.0
 */
import { Alt1 } from './Alt.d.ts'
import { Applicative1 } from './Applicative.d.ts'
import { Apply1 } from './Apply.d.ts'
import { Chain1 } from './Chain.d.ts'
import { ChainRec1 } from './ChainRec.d.ts'
import { Comonad1 } from './Comonad.d.ts'
import { Eq } from './Eq.d.ts'
import { Foldable1 } from './Foldable.d.ts'
import { Functor1 } from './Functor.d.ts'
import { Monad1 } from './Monad.d.ts'
import { Monoid } from './Monoid.d.ts'
import { Pointed1 } from './Pointed.d.ts'
import { Show } from './Show.d.ts'
import { PipeableTraverse1, Traversable1 } from './Traversable.d.ts'
/**
 * @category model
 * @since 2.0.0
 */
export declare type Identity<A> = A
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category mapping
 * @since 2.0.0
 */
export declare const map: <A, B>(f: (a: A) => B) => (fa: Identity<A>) => Identity<B>
/**
 * @since 2.0.0
 */
export declare const ap: <A>(fa: Identity<A>) => <B>(fab: Identity<(a: A) => B>) => Identity<B>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const of: <A>(a: A) => Identity<A>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category sequencing
 * @since 2.0.0
 */
export declare const chain: <A, B>(f: (a: A) => Identity<B>) => (ma: Identity<A>) => Identity<B>
/**
 * @since 2.0.0
 */
export declare const extend: <A, B>(f: (wa: Identity<A>) => B) => (wa: Identity<A>) => Identity<B>
/**
 * @category Extract
 * @since 2.6.2
 */
export declare const extract: <A>(wa: Identity<A>) => A
/**
 * @since 2.0.0
 */
export declare const duplicate: <A>(ma: Identity<A>) => Identity<Identity<A>>
/**
 * @category sequencing
 * @since 2.0.0
 */
export declare const flatten: <A>(mma: Identity<Identity<A>>) => Identity<A>
/**
 * @category folding
 * @since 2.0.0
 */
export declare const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => (fa: Identity<A>) => B
/**
 * @category folding
 * @since 2.0.0
 */
export declare const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => (fa: Identity<A>) => M
/**
 * @category folding
 * @since 2.0.0
 */
export declare const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => (fa: Identity<A>) => B
/**
 * @category traversing
 * @since 2.6.3
 */
export declare const traverse: PipeableTraverse1<URI>
/**
 * @category traversing
 * @since 2.6.3
 */
export declare const sequence: Traversable1<URI>['sequence']
/**
 * Less strict version of [`alt`](#alt).
 *
 * The `W` suffix (short for **W**idening) means that the return types will be merged.
 *
 * @category error handling
 * @since 2.9.0
 */
export declare const altW: <B>(that: () => Identity<B>) => <A>(fa: Identity<A>) => Identity<A | B>
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category error handling
 * @since 2.0.0
 */
export declare const alt: <A>(that: () => Identity<A>) => (fa: Identity<A>) => Identity<A>
/**
 * @category type lambdas
 * @since 2.0.0
 */
export declare const URI = 'Identity'
/**
 * @category type lambdas
 * @since 2.0.0
 */
export declare type URI = typeof URI
declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: Identity<A>
  }
}
/**
 * @category instances
 * @since 2.0.0
 */
export declare const getShow: <A>(S: Show<A>) => Show<Identity<A>>
/**
 * @category instances
 * @since 2.0.0
 */
export declare const getEq: <A>(E: Eq<A>) => Eq<Identity<A>>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Functor: Functor1<URI>
/**
 * @category mapping
 * @since 2.10.0
 */
export declare const flap: <A>(a: A) => <B>(fab: (a: A) => B) => B
/**
 * @category instances
 * @since 2.10.0
 */
export declare const Pointed: Pointed1<URI>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const Apply: Apply1<URI>
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @since 2.0.0
 */
export declare const apFirst: <B>(second: B) => <A>(first: A) => A
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @since 2.0.0
 */
export declare const apSecond: <B>(second: B) => <A>(first: A) => B
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Applicative: Applicative1<URI>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const Chain: Chain1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Monad: Monad1<URI>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category sequencing
 * @since 2.0.0
 */
export declare const chainFirst: <A, B>(f: (a: A) => B) => (first: A) => A
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Foldable: Foldable1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Traversable: Traversable1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Alt: Alt1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Comonad: Comonad1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const ChainRec: ChainRec1<URI>
/**
 * @category do notation
 * @since 2.9.0
 */
export declare const Do: Identity<{}>
/**
 * @category do notation
 * @since 2.8.0
 */
export declare const bindTo: <N extends string>(name: N) => <A>(fa: A) => { readonly [K in N]: A }
declare const let_: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => (fa: A) => { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }
export {
  /**
   * @category do notation
   * @since 2.13.0
   */
  let_ as let
}
/**
 * @category do notation
 * @since 2.8.0
 */
export declare const bind: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => (ma: A) => { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }
/**
 * @category do notation
 * @since 2.8.0
 */
export declare const apS: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  fb: B
) => (fa: A) => { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }
/**
 * This instance is deprecated, use small, specific instances instead.
 * For example if a function needs a `Functor` instance, pass `I.Functor` instead of `I.identity`
 * (where `I` is from `import I from 'fp-ts/Identity'`)
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export declare const identity: Monad1<URI> &
  Foldable1<URI> &
  Traversable1<URI> &
  Alt1<URI> &
  Comonad1<URI> &
  ChainRec1<URI>
