/**
 * @since 2.13.0
 */
import { Applicative2 } from './Applicative.d.ts'
import { Apply2 } from './Apply.d.ts'
import { Chain2 } from './Chain.d.ts'
import { FromIO2 } from './FromIO.d.ts'
import { FromReader2 } from './FromReader.d.ts'
import { Functor2 } from './Functor.d.ts'
import * as I from './IO.d.ts'
import { Monad2 } from './Monad.d.ts'
import { MonadIO2 } from './MonadIO.d.ts'
import { Pointed2 } from './Pointed.d.ts'
import * as R from './Reader.d.ts'
import { Reader } from './Reader.d.ts'
import { IO } from './IO.d.ts'
import { ReadonlyNonEmptyArray } from './ReadonlyNonEmptyArray.d.ts'
/**
 * @category model
 * @since 2.13.0
 */
export interface ReaderIO<R, A> {
  (r: R): I.IO<A>
}
/**
 * @category conversions
 * @since 2.13.0
 */
export declare const fromReader: <R, A>(fa: Reader<R, A>) => ReaderIO<R, A>
/**
 * @category conversions
 * @since 2.13.0
 */
export declare const fromIO: <A, R = unknown>(fa: IO<A>) => ReaderIO<R, A>
/**
 * Changes the value of the local context during the execution of the action `ma` (similar to `Contravariant`'s
 * `contramap`).
 *
 * @since 2.13.0
 */
export declare const local: <R2, R1>(f: (r2: R2) => R1) => <A>(ma: ReaderIO<R1, A>) => ReaderIO<R2, A>
/**
 * Less strict version of [`asksReaderIO`](#asksreaderio).
 *
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @category constructors
 * @since 2.13.0
 */
export declare const asksReaderIOW: <R1, R2, A>(f: (r1: R1) => ReaderIO<R2, A>) => ReaderIO<R1 & R2, A>
/**
 * Effectfully accesses the environment.
 *
 * @category constructors
 * @since 2.13.0
 */
export declare const asksReaderIO: <R, A>(f: (r: R) => ReaderIO<R, A>) => ReaderIO<R, A>
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category mapping
 * @since 2.13.0
 */
export declare const map: <A, B>(f: (a: A) => B) => <R>(fa: ReaderIO<R, A>) => ReaderIO<R, B>
/**
 * @since 2.13.0
 */
export declare const ap: <R, A>(fa: ReaderIO<R, A>) => <B>(fab: ReaderIO<R, (a: A) => B>) => ReaderIO<R, B>
/**
 * Less strict version of [`ap`](#ap).
 *
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @since 2.13.0
 */
export declare const apW: <R2, A>(
  fa: ReaderIO<R2, A>
) => <R1, B>(fab: ReaderIO<R1, (a: A) => B>) => ReaderIO<R1 & R2, B>
/**
 * @category constructors
 * @since 2.13.0
 */
export declare const of: <R = unknown, A = never>(a: A) => ReaderIO<R, A>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category sequencing
 * @since 2.13.0
 */
export declare const chain: <A, R, B>(f: (a: A) => ReaderIO<R, B>) => (ma: ReaderIO<R, A>) => ReaderIO<R, B>
/**
 * Less strict version of  [`chain`](#chain).
 *
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainW: <A, R2, B>(
  f: (a: A) => ReaderIO<R2, B>
) => <R1>(ma: ReaderIO<R1, A>) => ReaderIO<R1 & R2, B>
/**
 * Less strict version of [`flatten`](#flatten).
 *
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @category sequencing
 * @since 2.13.0
 */
export declare const flattenW: <R1, R2, A>(mma: ReaderIO<R1, ReaderIO<R2, A>>) => ReaderIO<R1 & R2, A>
/**
 * @category sequencing
 * @since 2.13.0
 */
export declare const flatten: <R, A>(mma: ReaderIO<R, ReaderIO<R, A>>) => ReaderIO<R, A>
/**
 * @category type lambdas
 * @since 2.13.0
 */
export declare const URI = 'ReaderIO'
/**
 * @category type lambdas
 * @since 2.13.0
 */
export declare type URI = typeof URI
declare module './HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: ReaderIO<E, A>
  }
}
/**
 * @category instances
 * @since 2.13.0
 */
export declare const Functor: Functor2<URI>
/**
 * @category mapping
 * @since 2.13.0
 */
export declare const flap: <A>(a: A) => <E, B>(fab: ReaderIO<E, (a: A) => B>) => ReaderIO<E, B>
/**
 * @category instances
 * @since 2.13.0
 */
export declare const Pointed: Pointed2<URI>
/**
 * @category instances
 * @since 2.13.0
 */
export declare const Apply: Apply2<URI>
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @since 2.13.0
 */
export declare const apFirst: <E, B>(second: ReaderIO<E, B>) => <A>(first: ReaderIO<E, A>) => ReaderIO<E, A>
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @since 2.13.0
 */
export declare const apSecond: <E, B>(second: ReaderIO<E, B>) => <A>(first: ReaderIO<E, A>) => ReaderIO<E, B>
/**
 * @category instances
 * @since 2.13.0
 */
export declare const Applicative: Applicative2<URI>
/**
 * @category instances
 * @since 2.13.0
 */
export declare const Chain: Chain2<URI>
/**
 * @category instances
 * @since 2.13.0
 */
export declare const Monad: Monad2<URI>
/**
 * @category instances
 * @since 2.13.0
 */
export declare const MonadIO: MonadIO2<URI>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainFirst: <A, R, B>(f: (a: A) => ReaderIO<R, B>) => (first: ReaderIO<R, A>) => ReaderIO<R, A>
/**
 * Less strict version of [`chainFirst`](#chainfirst).
 *
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainFirstW: <A, R2, B>(
  f: (a: A) => ReaderIO<R2, B>
) => <R1>(ma: ReaderIO<R1, A>) => ReaderIO<R1 & R2, A>
/**
 * @category instances
 * @since 2.13.0
 */
export declare const FromIO: FromIO2<URI>
/**
 * @category lifting
 * @since 2.13.0
 */
export declare const fromIOK: <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => I.IO<B>
) => <R = unknown>(...a: A) => ReaderIO<R, B>
/**
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainIOK: <A, B>(f: (a: A) => I.IO<B>) => <E>(first: ReaderIO<E, A>) => ReaderIO<E, B>
/**
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainFirstIOK: <A, B>(f: (a: A) => I.IO<B>) => <E>(first: ReaderIO<E, A>) => ReaderIO<E, A>
/**
 * @category instances
 * @since 2.13.0
 */
export declare const FromReader: FromReader2<URI>
/**
 * Reads the current context.
 *
 * @category constructors
 * @since 2.13.0
 */
export declare const ask: <R>() => ReaderIO<R, R>
/**
 * Projects a value from the global context in a `ReaderIO`.
 *
 * @category constructors
 * @since 2.13.0
 */
export declare const asks: <R, A>(f: (r: R) => A) => ReaderIO<R, A>
/**
 * @category lifting
 * @since 2.13.0
 */
export declare const fromReaderK: <A extends ReadonlyArray<unknown>, R, B>(
  f: (...a: A) => R.Reader<R, B>
) => (...a: A) => ReaderIO<R, B>
/**
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainReaderK: <A, R, B>(f: (a: A) => R.Reader<R, B>) => (ma: ReaderIO<R, A>) => ReaderIO<R, B>
/**
 * Less strict version of [`chainReaderK`](#chainreaderk).
 *
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainReaderKW: <A, R1, B>(
  f: (a: A) => R.Reader<R1, B>
) => <R2>(ma: ReaderIO<R2, A>) => ReaderIO<R1 & R2, B>
/**
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainFirstReaderK: <A, R, B>(f: (a: A) => R.Reader<R, B>) => (ma: ReaderIO<R, A>) => ReaderIO<R, A>
/**
 * Less strict version of [`chainFirstReaderK`](#chainfirstreaderk).
 *
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @category sequencing
 * @since 2.13.0
 */
export declare const chainFirstReaderKW: <A, R1, B>(
  f: (a: A) => R.Reader<R1, B>
) => <R2>(ma: ReaderIO<R2, A>) => ReaderIO<R1 & R2, A>
/**
 * @category do notation
 * @since 2.13.0
 */
export declare const Do: ReaderIO<unknown, {}>
/**
 * @category do notation
 * @since 2.13.0
 */
export declare const bindTo: <N extends string>(
  name: N
) => <E, A>(fa: ReaderIO<E, A>) => ReaderIO<E, { readonly [K in N]: A }>
/**
 * @category do notation
 * @since 2.13.0
 */
export declare const bind: <N extends string, A, E, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => ReaderIO<E, B>
) => (ma: ReaderIO<E, A>) => ReaderIO<E, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>
/**
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @category do notation
 * @since 2.13.0
 */
export declare const bindW: <N extends string, A, R2, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => ReaderIO<R2, B>
) => <R1>(fa: ReaderIO<R1, A>) => ReaderIO<
  R1 & R2,
  {
    readonly [K in keyof A | N]: K extends keyof A ? A[K] : B
  }
>
/**
 * @category do notation
 * @since 2.13.0
 */
export declare const apS: <N extends string, A, E, B>(
  name: Exclude<N, keyof A>,
  fb: ReaderIO<E, B>
) => (fa: ReaderIO<E, A>) => ReaderIO<E, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>
/**
 * Less strict version of [`apS`](#aps).
 *
 * The `W` suffix (short for **W**idening) means that the environment types will be merged.
 *
 * @category do notation
 * @since 2.13.0
 */
export declare const apSW: <N extends string, A, R2, B>(
  name: Exclude<N, keyof A>,
  fb: ReaderIO<R2, B>
) => <R1>(fa: ReaderIO<R1, A>) => ReaderIO<
  R1 & R2,
  {
    readonly [K in keyof A | N]: K extends keyof A ? A[K] : B
  }
>
/**
 * @since 2.13.0
 */
export declare const ApT: ReaderIO<unknown, readonly []>
/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(Applicative)`.
 *
 * @category traversing
 * @since 2.13.0
 */
export declare const traverseReadonlyNonEmptyArrayWithIndex: <A, R, B>(
  f: (index: number, a: A) => ReaderIO<R, B>
) => (as: ReadonlyNonEmptyArray<A>) => ReaderIO<R, ReadonlyNonEmptyArray<B>>
/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @category traversing
 * @since 2.13.0
 */
export declare const traverseReadonlyArrayWithIndex: <A, R, B>(
  f: (index: number, a: A) => ReaderIO<R, B>
) => (as: readonly A[]) => ReaderIO<R, readonly B[]>
/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @category traversing
 * @since 2.13.0
 */
export declare const traverseArrayWithIndex: <A, R, B>(
  f: (index: number, a: A) => ReaderIO<R, B>
) => (as: ReadonlyArray<A>) => ReaderIO<R, ReadonlyArray<B>>
/**
 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
 *
 * @category traversing
 * @since 2.13.0
 */
export declare const traverseArray: <A, R, B>(
  f: (a: A) => ReaderIO<R, B>
) => (as: readonly A[]) => ReaderIO<R, readonly B[]>
/**
 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
 *
 * @category traversing
 * @since 2.13.0
 */
export declare const sequenceArray: <R, A>(arr: ReadonlyArray<ReaderIO<R, A>>) => ReaderIO<R, ReadonlyArray<A>>
