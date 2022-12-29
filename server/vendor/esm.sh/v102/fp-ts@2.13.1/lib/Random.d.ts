/**
 * @since 2.0.0
 */
import { IO } from './IO.d.ts'
import { ReadonlyNonEmptyArray } from './ReadonlyNonEmptyArray.d.ts'
/**
 * Returns a random number between 0 (inclusive) and 1 (exclusive). This is a direct wrapper around JavaScript's
 * `Math.random()`.
 *
 * @since 2.0.0
 */
export declare const random: IO<number>
/**
 * Takes a range specified by `low` (the first argument) and `high` (the second), and returns a random integer uniformly
 * distributed in the closed interval `[low, high]`. It is unspecified what happens if `low > high`, or if either of
 * `low` or `high` is not an integer.
 *
 * @since 2.0.0
 */
export declare function randomInt(low: number, high: number): IO<number>
/**
 * Returns a random number between a minimum value (inclusive) and a maximum value (exclusive). It is unspecified what
 * happens if `maximum < minimum`.
 *
 * @since 2.0.0
 */
export declare function randomRange(min: number, max: number): IO<number>
/**
 * Returns a random boolean value with an equal chance of being `true` or `false`
 *
 * @since 2.0.0
 */
export declare const randomBool: IO<boolean>
/**
 * Returns a random element of a `ReadonlyNonEmptyArray`.
 *
 * @since 2.10.0
 */
export declare const randomElem: <A>(as: ReadonlyNonEmptyArray<A>) => IO<A>
