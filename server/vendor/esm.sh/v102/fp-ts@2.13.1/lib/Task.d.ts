/**
 * ```ts
 * interface Task<A> {
 *   (): Promise<A>
 * }
 * ```
 *
 * `Task<A>` represents an asynchronous computation that yields a value of type `A` and **never fails**.
 * If you want to represent an asynchronous computation that may fail, please see `TaskEither`.
 *
 * @since 2.0.0
 */
import { Applicative1 } from './Applicative.d.ts'
import { Apply1 } from './Apply.d.ts'
import { Chain1 } from './Chain.d.ts'
import { FromIO1 } from './FromIO.d.ts'
import { FromTask1 } from './FromTask.d.ts'
import { Functor1 } from './Functor.d.ts'
import { Monad1 } from './Monad.d.ts'
import { MonadIO1 } from './MonadIO.d.ts'
import { MonadTask1 } from './MonadTask.d.ts'
import { Monoid } from './Monoid.d.ts'
import { Pointed1 } from './Pointed.d.ts'
import { ReadonlyNonEmptyArray } from './ReadonlyNonEmptyArray.d.ts'
import { Semigroup } from './Semigroup.d.ts'
import { IO } from './IO.d.ts'
/**
 * @category model
 * @since 2.0.0
 */
export interface Task<A> {
  (): Promise<A>
}
/**
 * @category conversions
 * @since 2.0.0
 */
export declare const fromIO: <A>(fa: IO<A>) => Task<A>
/**
 * Creates a task that will complete after a time delay
 *
 * @example
 * import { sequenceT } from 'fp-ts/Apply'
 * import * as T from 'fp-ts/Task'
 * import { takeRight } from 'fp-ts/Array'
 *
 * async function test() {
 *   const log: Array<string> = []
 *   const append = (message: string): T.Task<void> =>
 *     T.fromIO(() => {
 *       log.push(message)
 *     })
 *   const fa = append('a')
 *   const fb = T.delay(20)(append('b'))
 *   const fc = T.delay(10)(append('c'))
 *   const fd = append('d')
 *   await sequenceT(T.ApplyPar)(fa, fb, fc, fd)()
 *   assert.deepStrictEqual(takeRight(2)(log), ['c', 'b'])
 * }
 *
 * test()
 *
 * @since 2.0.0
 */
export declare function delay(millis: number): <A>(ma: Task<A>) => Task<A>
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category mapping
 * @since 2.0.0
 */
export declare const map: <A, B>(f: (a: A) => B) => (fa: Task<A>) => Task<B>
/**
 * @since 2.0.0
 */
export declare const ap: <A>(fa: Task<A>) => <B>(fab: Task<(a: A) => B>) => Task<B>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const of: <A>(a: A) => Task<A>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category sequencing
 * @since 2.0.0
 */
export declare const chain: <A, B>(f: (a: A) => Task<B>) => (ma: Task<A>) => Task<B>
/**
 * @category sequencing
 * @since 2.0.0
 */
export declare const flatten: <A>(mma: Task<Task<A>>) => Task<A>
/**
 * @category type lambdas
 * @since 2.0.0
 */
export declare const URI = 'Task'
/**
 * @category type lambdas
 * @since 2.0.0
 */
export declare type URI = typeof URI
declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: Task<A>
  }
}
/**
 * Monoid returning the first completed task.
 *
 * Note: uses `Promise.race` internally.
 *
 * @example
 * import * as T from 'fp-ts/Task'
 *
 * async function test() {
 *   const S = T.getRaceMonoid<string>()
 *   const fa = T.delay(20)(T.of('a'))
 *   const fb = T.delay(10)(T.of('b'))
 *   assert.deepStrictEqual(await S.concat(fa, fb)(), 'b')
 * }
 *
 * test()
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getRaceMonoid<A = never>(): Monoid<Task<A>>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Functor: Functor1<URI>
/**
 * @category mapping
 * @since 2.10.0
 */
export declare const flap: <A>(a: A) => <B>(fab: Task<(a: A) => B>) => Task<B>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const Pointed: Pointed1<URI>
/**
 * Runs computations in parallel.
 *
 * @category instances
 * @since 2.10.0
 */
export declare const ApplyPar: Apply1<URI>
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @since 2.0.0
 */
export declare const apFirst: <B>(second: Task<B>) => <A>(first: Task<A>) => Task<A>
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @since 2.0.0
 */
export declare const apSecond: <B>(second: Task<B>) => <A>(first: Task<A>) => Task<B>
/**
 * Runs computations in parallel.
 *
 * @category instances
 * @since 2.7.0
 */
export declare const ApplicativePar: Applicative1<URI>
/**
 * Runs computations sequentially.
 *
 * @category instances
 * @since 2.10.0
 */
export declare const ApplySeq: Apply1<URI>
/**
 * Runs computations sequentially.
 *
 * @category instances
 * @since 2.7.0
 */
export declare const ApplicativeSeq: Applicative1<URI>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const Chain: Chain1<URI>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const Monad: Monad1<URI>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const MonadIO: MonadIO1<URI>
/**
 * @category zone of death
 * @since 2.7.0
 * @deprecated
 */
export declare const fromTask: <A>(fa: Task<A>) => Task<A>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const MonadTask: MonadTask1<URI>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category sequencing
 * @since 2.0.0
 */
export declare const chainFirst: <A, B>(f: (a: A) => Task<B>) => (first: Task<A>) => Task<A>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const FromIO: FromIO1<URI>
/**
 * @category lifting
 * @since 2.4.0
 */
export declare const fromIOK: <A extends ReadonlyArray<unknown>, B>(f: (...a: A) => IO<B>) => (...a: A) => Task<B>
/**
 * @category sequencing
 * @since 2.4.0
 */
export declare const chainIOK: <A, B>(f: (a: A) => IO<B>) => (first: Task<A>) => Task<B>
/**
 * @category sequencing
 * @since 2.10.0
 */
export declare const chainFirstIOK: <A, B>(f: (a: A) => IO<B>) => (first: Task<A>) => Task<A>
/**
 * @category instances
 * @since 2.10.0
 */
export declare const FromTask: FromTask1<URI>
/**
 * A `Task` that never completes.
 *
 * @since 2.0.0
 */
export declare const never: Task<never>
/**
 * @category do notation
 * @since 2.9.0
 */
export declare const Do: Task<{}>
/**
 * @category do notation
 * @since 2.8.0
 */
export declare const bindTo: <N extends string>(name: N) => <A>(fa: Task<A>) => Task<{ readonly [K in N]: A }>
declare const let_: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => (fa: Task<A>) => Task<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>
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
  f: (a: A) => Task<B>
) => (ma: Task<A>) => Task<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>
/**
 * @category do notation
 * @since 2.8.0
 */
export declare const apS: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  fb: Task<B>
) => (fa: Task<A>) => Task<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>
/**
 * @since 2.11.0
 */
export declare const ApT: Task<readonly []>
/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(ApplicativePar)`.
 *
 * @category traversing
 * @since 2.11.0
 */
export declare const traverseReadonlyNonEmptyArrayWithIndex: <A, B>(
  f: (index: number, a: A) => Task<B>
) => (as: ReadonlyNonEmptyArray<A>) => Task<ReadonlyNonEmptyArray<B>>
/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativePar)`.
 *
 * @category traversing
 * @since 2.11.0
 */
export declare const traverseReadonlyArrayWithIndex: <A, B>(
  f: (index: number, a: A) => Task<B>
) => (as: readonly A[]) => Task<readonly B[]>
/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(ApplicativeSeq)`.
 *
 * @category traversing
 * @since 2.11.0
 */
export declare const traverseReadonlyNonEmptyArrayWithIndexSeq: <A, B>(
  f: (index: number, a: A) => Task<B>
) => (as: ReadonlyNonEmptyArray<A>) => Task<ReadonlyNonEmptyArray<B>>
/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativeSeq)`.
 *
 * @category traversing
 * @since 2.11.0
 */
export declare const traverseReadonlyArrayWithIndexSeq: <A, B>(
  f: (index: number, a: A) => Task<B>
) => (as: readonly A[]) => Task<readonly B[]>
/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export declare const traverseArrayWithIndex: <A, B>(
  f: (index: number, a: A) => Task<B>
) => (as: ReadonlyArray<A>) => Task<ReadonlyArray<B>>
/**
 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export declare const traverseArray: <A, B>(f: (a: A) => Task<B>) => (as: readonly A[]) => Task<readonly B[]>
/**
 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export declare const sequenceArray: <A>(arr: ReadonlyArray<Task<A>>) => Task<ReadonlyArray<A>>
/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(ApplicativeSeq)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export declare const traverseSeqArrayWithIndex: <A, B>(
  f: (index: number, a: A) => Task<B>
) => (as: ReadonlyArray<A>) => Task<ReadonlyArray<B>>
/**
 * Equivalent to `ReadonlyArray#traverse(ApplicativeSeq)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export declare const traverseSeqArray: <A, B>(f: (a: A) => Task<B>) => (as: readonly A[]) => Task<readonly B[]>
/**
 * Equivalent to `ReadonlyArray#sequence(ApplicativeSeq)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export declare const sequenceSeqArray: <A>(arr: ReadonlyArray<Task<A>>) => Task<ReadonlyArray<A>>
/**
 * This instance is deprecated, use small, specific instances instead.
 * For example if a function needs a `Functor` instance, pass `T.Functor` instead of `T.task`
 * (where `T` is from `import T from 'fp-ts/Task'`)
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export declare const task: Monad1<URI> & MonadTask1<URI>
/**
 * This instance is deprecated, use small, specific instances instead.
 * For example if a function needs a `Functor` instance, pass `T.Functor` instead of `T.taskSeq`
 * (where `T` is from `import T from 'fp-ts/Task'`)
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export declare const taskSeq: Monad1<URI> & MonadTask1<URI>
/**
 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export declare const getSemigroup: <A>(S: Semigroup<A>) => Semigroup<Task<A>>
/**
 * Use [`getApplicativeMonoid`](./Applicative.ts.html#getapplicativemonoid) instead.
 *
 * Lift a monoid into 'Task', the inner values are concatenated using the provided `Monoid`.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export declare const getMonoid: <A>(M: Monoid<A>) => Monoid<Task<A>>
