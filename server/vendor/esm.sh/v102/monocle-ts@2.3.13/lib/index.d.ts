import { Foldable, Foldable1, Foldable2, Foldable3 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Foldable/lib/index.d.ts'
import { Predicate, Refinement } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/function/lib/index.d.ts'
import { HKT, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/HKT/lib/index.d.ts'
import { Monoid } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Monoid/lib/index.d.ts'
import { Option } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Option/lib/index.d.ts'
import { Traversable, Traversable1, Traversable2, Traversable3 } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Traversable/lib/index.d.ts'
import * as at from './At.d.ts'
import * as iso from './Iso.d.ts'
import * as index from './Ix.d.ts'
import * as lens from './Lens.d.ts'
import * as optional from './Optional.d.ts'
import * as prism from './Prism.d.ts'
import * as traversal from './Traversal.d.ts'
export {
  /**
   * @since 2.3.0
   */
  at,
  /**
   * @since 2.3.0
   */
  iso,
  /**
   * @since 2.3.0
   */
  index,
  /**
   * @since 2.3.0
   */
  lens,
  /**
   * @since 2.3.0
   */
  prism,
  /**
   * @since 2.3.0
   */
  optional,
  /**
   * @since 2.3.0
   */
  traversal
}
/**
 * Laws:
 * 1. `reverseGet(get(s)) = s`
 * 2. `get(reversetGet(a)) = a`
 *
 * @category constructor
 * @since 1.0.0
 */
export declare class Iso<S, A> {
  readonly get: (s: S) => A
  readonly reverseGet: (a: A) => S
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Iso'
  /**
   * @since 1.0.0
   */
  readonly unwrap: (s: S) => A
  /**
   * @since 1.0.0
   */
  readonly to: (s: S) => A
  /**
   * @since 1.0.0
   */
  readonly wrap: (a: A) => S
  /**
   * @since 1.0.0
   */
  readonly from: (a: A) => S
  constructor(get: (s: S) => A, reverseGet: (a: A) => S)
  /**
   * reverse the `Iso`: the source becomes the target and the target becomes the source
   * @since 1.0.0
   */
  reverse(): Iso<A, S>
  /**
   * @since 1.0.0
   */
  modify(f: (a: A) => A): (s: S) => S
  /**
   * view an `Iso` as a `Lens`
   *
   * @since 1.0.0
   */
  asLens(): Lens<S, A>
  /**
   * view an `Iso` as a `Prism`
   *
   * @since 1.0.0
   */
  asPrism(): Prism<S, A>
  /**
   * view an `Iso` as a `Optional`
   *
   * @since 1.0.0
   */
  asOptional(): Optional<S, A>
  /**
   * view an `Iso` as a `Traversal`
   *
   * @since 1.0.0
   */
  asTraversal(): Traversal<S, A>
  /**
   * view an `Iso` as a `Fold`
   *
   * @since 1.0.0
   */
  asFold(): Fold<S, A>
  /**
   * view an `Iso` as a `Getter`
   *
   * @since 1.0.0
   */
  asGetter(): Getter<S, A>
  /**
   * view an `Iso` as a `Setter`
   *
   * @since 1.0.0
   */
  asSetter(): Setter<S, A>
  /**
   * compose an `Iso` with an `Iso`
   *
   * @since 1.0.0
   */
  compose<B>(ab: Iso<A, B>): Iso<S, B>
  /**
   * Alias of `compose`
   *
   * @since 1.0.0
   */
  composeIso<B>(ab: Iso<A, B>): Iso<S, B>
  /**
   * compose an `Iso` with a `Lens `
   *
   * @since 1.0.0
   */
  composeLens<B>(ab: Lens<A, B>): Lens<S, B>
  /**
   * compose an `Iso` with a `Prism`
   *
   * @since 1.0.0
   */
  composePrism<B>(ab: Prism<A, B>): Prism<S, B>
  /**
   * compose an `Iso` with an `Optional`
   *
   * @since 1.0.0
   */
  composeOptional<B>(ab: Optional<A, B>): Optional<S, B>
  /**
   * compose an `Iso` with a `Traversal`
   *
   * @since 1.0.0
   */
  composeTraversal<B>(ab: Traversal<A, B>): Traversal<S, B>
  /**
   * compose an `Iso` with a `Fold`
   *
   * @since 1.0.0
   */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B>
  /**
   * compose an `Iso` with a `Getter`
   *
   * @since 1.0.0
   */
  composeGetter<B>(ab: Getter<A, B>): Getter<S, B>
  /**
   * compose an `Iso` with a `Setter`
   *
   * @since 1.0.0
   */
  composeSetter<B>(ab: Setter<A, B>): Setter<S, B>
}
/**
 * @since 1.3.0
 */
export interface LensFromPath<S> {
  <
    K1 extends keyof S,
    K2 extends keyof S[K1],
    K3 extends keyof S[K1][K2],
    K4 extends keyof S[K1][K2][K3],
    K5 extends keyof S[K1][K2][K3][K4]
  >(
    path: [K1, K2, K3, K4, K5]
  ): Lens<S, S[K1][K2][K3][K4][K5]>
  <K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3]>(
    path: [K1, K2, K3, K4]
  ): Lens<S, S[K1][K2][K3][K4]>
  <K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(path: [K1, K2, K3]): Lens<S, S[K1][K2][K3]>
  <K1 extends keyof S, K2 extends keyof S[K1]>(path: [K1, K2]): Lens<S, S[K1][K2]>
  <K1 extends keyof S>(path: [K1]): Lens<S, S[K1]>
}
/**
 * Laws:
 * 1. `get(set(a)(s)) = a`
 * 2. `set(get(s))(s) = s`
 * 3. `set(a)(set(a)(s)) = set(a)(s)`
 *
 * @category constructor
 * @since 1.0.0
 */
export declare class Lens<S, A> {
  readonly get: (s: S) => A
  readonly set: (a: A) => (s: S) => S
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Lens'
  constructor(get: (s: S) => A, set: (a: A) => (s: S) => S)
  /**
   * @example
   * import { Lens } from 'monocle-ts'
   *
   * type Person = {
   *   name: string
   *   age: number
   *   address: {
   *     city: string
   *   }
   * }
   *
   * const city = Lens.fromPath<Person>()(['address', 'city'])
   *
   * const person: Person = { name: 'Giulio', age: 43, address: { city: 'Milan' } }
   *
   * assert.strictEqual(city.get(person), 'Milan')
   * assert.deepStrictEqual(city.set('London')(person), { name: 'Giulio', age: 43, address: { city: 'London' } })
   *
   * @since 1.0.0
   */
  static fromPath<S>(): LensFromPath<S>
  /**
   * Returns a `Lens` from a type and a prop
   *
   * @example
   * import { Lens } from 'monocle-ts'
   *
   * type Person = {
   *   name: string
   *   age: number
   * }
   *
   * const age = Lens.fromProp<Person>()('age')
   *
   * const person: Person = { name: 'Giulio', age: 43 }
   *
   * assert.strictEqual(age.get(person), 43)
   * assert.deepStrictEqual(age.set(44)(person), { name: 'Giulio', age: 44 })
   *
   * @since 1.0.0
   */
  static fromProp<S>(): <P extends keyof S>(prop: P) => Lens<S, S[P]>
  /**
   * Returns a `Lens` from a type and an array of props
   *
   * @example
   * import { Lens } from 'monocle-ts'
   *
   * interface Person {
   *   name: string
   *   age: number
   *   rememberMe: boolean
   * }
   *
   * const lens = Lens.fromProps<Person>()(['name', 'age'])
   *
   * const person: Person = { name: 'Giulio', age: 44, rememberMe: true }
   *
   * assert.deepStrictEqual(lens.get(person), { name: 'Giulio', age: 44 })
   * assert.deepStrictEqual(lens.set({ name: 'Guido', age: 47 })(person), { name: 'Guido', age: 47, rememberMe: true })
   *
   * @since 1.0.0
   */
  static fromProps<S>(): <P extends keyof S>(
    props: Array<P>
  ) => Lens<
    S,
    {
      [K in P]: S[K]
    }
  >
  /**
   * Returns a `Lens` from a nullable (`A | null | undefined`) prop
   *
   * @example
   * import { Lens } from 'monocle-ts'
   *
   * interface Outer {
   *   inner?: Inner
   * }
   *
   * interface Inner {
   *   value: number
   *   foo: string
   * }
   *
   * const inner = Lens.fromNullableProp<Outer>()('inner', { value: 0, foo: 'foo' })
   * const value = Lens.fromProp<Inner>()('value')
   * const lens = inner.compose(value)
   *
   * assert.deepStrictEqual(lens.set(1)({}), { inner: { value: 1, foo: 'foo' } })
   * assert.strictEqual(lens.get({}), 0)
   * assert.deepStrictEqual(lens.set(1)({ inner: { value: 1, foo: 'bar' } }), { inner: { value: 1, foo: 'bar' } })
   * assert.strictEqual(lens.get({ inner: { value: 1, foo: 'bar' } }), 1)
   *
   * @since 1.0.0
   */
  static fromNullableProp<S>(): <A extends S[K], K extends keyof S>(k: K, defaultValue: A) => Lens<S, NonNullable<S[K]>>
  /**
   * @since 1.0.0
   */
  modify(f: (a: A) => A): (s: S) => S
  /**
   * view a `Lens` as a Optional
   *
   * @since 1.0.0
   */
  asOptional(): Optional<S, A>
  /**
   * view a `Lens` as a `Traversal`
   *
   * @since 1.0.0
   */
  asTraversal(): Traversal<S, A>
  /**
   * view a `Lens` as a `Setter`
   *
   * @since 1.0.0
   */
  asSetter(): Setter<S, A>
  /**
   * view a `Lens` as a `Getter`
   *
   * @since 1.0.0
   */
  asGetter(): Getter<S, A>
  /**
   * view a `Lens` as a `Fold`
   *
   * @since 1.0.0
   */
  asFold(): Fold<S, A>
  /**
   * compose a `Lens` with a `Lens`
   *
   * @since 1.0.0
   */
  compose<B>(ab: Lens<A, B>): Lens<S, B>
  /**
   * Alias of `compose`
   *
   * @since 1.0.0
   */
  composeLens<B>(ab: Lens<A, B>): Lens<S, B>
  /**
   * compose a `Lens` with a `Getter`
   *
   * @since 1.0.0
   */
  composeGetter<B>(ab: Getter<A, B>): Getter<S, B>
  /**
   * compose a `Lens` with a `Fold`
   *
   * @since 1.0.0
   */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B>
  /**
   * compose a `Lens` with an `Optional`
   *
   * @since 1.0.0
   */
  composeOptional<B>(ab: Optional<A, B>): Optional<S, B>
  /**
   * compose a `Lens` with an `Traversal`
   *
   * @since 1.0.0
   */
  composeTraversal<B>(ab: Traversal<A, B>): Traversal<S, B>
  /**
   * compose a `Lens` with an `Setter`
   *
   * @since 1.0.0
   */
  composeSetter<B>(ab: Setter<A, B>): Setter<S, B>
  /**
   * compose a `Lens` with an `Iso`
   *
   * @since 1.0.0
   */
  composeIso<B>(ab: Iso<A, B>): Lens<S, B>
  /**
   * compose a `Lens` with a `Prism`
   *
   * @since 1.0.0
   */
  composePrism<B>(ab: Prism<A, B>): Optional<S, B>
}
/**
 * Laws:
 * 1. `pipe(getOption(s), fold(() => s, reverseGet)) = s`
 * 2. `getOption(reverseGet(a)) = some(a)`
 *
 * @category constructor
 * @since 1.0.0
 */
export declare class Prism<S, A> {
  readonly getOption: (s: S) => Option<A>
  readonly reverseGet: (a: A) => S
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Prism'
  constructor(getOption: (s: S) => Option<A>, reverseGet: (a: A) => S)
  /**
   * @since 1.0.0
   */
  static fromPredicate<S, A extends S>(refinement: Refinement<S, A>): Prism<S, A>
  static fromPredicate<A>(predicate: Predicate<A>): Prism<A, A>
  /**
   * @since 1.0.0
   */
  static some<A>(): Prism<Option<A>, A>
  /**
   * @since 1.0.0
   */
  modify(f: (a: A) => A): (s: S) => S
  /**
   * @since 1.0.0
   */
  modifyOption(f: (a: A) => A): (s: S) => Option<S>
  /**
   * set the target of a `Prism` with a value
   *
   * @since 1.0.0
   */
  set(a: A): (s: S) => S
  /**
   * view a `Prism` as a `Optional`
   *
   * @since 1.0.0
   */
  asOptional(): Optional<S, A>
  /**
   * view a `Prism` as a `Traversal`
   *
   * @since 1.0.0
   */
  asTraversal(): Traversal<S, A>
  /**
   * view a `Prism` as a `Setter`
   *
   * @since 1.0.0
   */
  asSetter(): Setter<S, A>
  /**
   * view a `Prism` as a `Fold`
   *
   * @since 1.0.0
   */
  asFold(): Fold<S, A>
  /**
   * compose a `Prism` with a `Prism`
   *
   * @since 1.0.0
   */
  compose<B>(ab: Prism<A, B>): Prism<S, B>
  /**
   * Alias of `compose`
   *
   * @since 1.0.0
   */
  composePrism<B>(ab: Prism<A, B>): Prism<S, B>
  /**
   * compose a `Prism` with a `Optional`
   *
   * @since 1.0.0
   */
  composeOptional<B>(ab: Optional<A, B>): Optional<S, B>
  /**
   * compose a `Prism` with a `Traversal`
   *
   * @since 1.0.0
   */
  composeTraversal<B>(ab: Traversal<A, B>): Traversal<S, B>
  /**
   * compose a `Prism` with a `Fold`
   *
   * @since 1.0.0
   */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B>
  /**
   * compose a `Prism` with a `Setter`
   *
   * @since 1.0.0
   */
  composeSetter<B>(ab: Setter<A, B>): Setter<S, B>
  /**
   * compose a `Prism` with a `Iso`
   *
   * @since 1.0.0
   */
  composeIso<B>(ab: Iso<A, B>): Prism<S, B>
  /**
   * compose a `Prism` with a `Lens`
   *
   * @since 1.0.0
   */
  composeLens<B>(ab: Lens<A, B>): Optional<S, B>
  /**
   * compose a `Prism` with a `Getter`
   *
   * @since 1.0.0
   */
  composeGetter<B>(ab: Getter<A, B>): Fold<S, B>
}
declare type OptionPropertyNames<S> = {
  [K in keyof S]-?: S[K] extends Option<any> ? K : never
}[keyof S]
declare type OptionPropertyType<S, K extends OptionPropertyNames<S>> = S[K] extends Option<infer A> ? A : never
/**
 * @since 2.1.0
 */
export interface OptionalFromPath<S> {
  <
    K1 extends keyof S,
    K2 extends keyof NonNullable<S[K1]>,
    K3 extends keyof NonNullable<NonNullable<S[K1]>[K2]>,
    K4 extends keyof NonNullable<NonNullable<NonNullable<S[K1]>[K2]>[K3]>,
    K5 extends keyof NonNullable<NonNullable<NonNullable<NonNullable<S[K1]>[K2]>[K3]>[K4]>
  >(
    path: [K1, K2, K3, K4, K5]
  ): Optional<S, NonNullable<NonNullable<NonNullable<NonNullable<NonNullable<S[K1]>[K2]>[K3]>[K4]>[K5]>>
  <
    K1 extends keyof S,
    K2 extends keyof NonNullable<S[K1]>,
    K3 extends keyof NonNullable<NonNullable<S[K1]>[K2]>,
    K4 extends keyof NonNullable<NonNullable<NonNullable<S[K1]>[K2]>[K3]>
  >(
    path: [K1, K2, K3, K4]
  ): Optional<S, NonNullable<NonNullable<NonNullable<NonNullable<S[K1]>[K2]>[K3]>[K4]>>
  <K1 extends keyof S, K2 extends keyof NonNullable<S[K1]>, K3 extends keyof NonNullable<NonNullable<S[K1]>[K2]>>(
    path: [K1, K2, K3]
  ): Optional<S, NonNullable<NonNullable<NonNullable<S[K1]>[K2]>[K3]>>
  <K1 extends keyof S, K2 extends keyof NonNullable<S[K1]>>(path: [K1, K2]): Optional<
    S,
    NonNullable<NonNullable<S[K1]>[K2]>
  >
  <K1 extends keyof S>(path: [K1]): Optional<S, NonNullable<S[K1]>>
}
/**
 * Laws:
 * 1. `pipe(getOption(s), fold(() => s, a => set(a)(s))) = s`
 * 2. `getOption(set(a)(s)) = pipe(getOption(s), map(_ => a))`
 * 3. `set(a)(set(a)(s)) = set(a)(s)`
 *
 * @category constructor
 * @since 1.0.0
 */
export declare class Optional<S, A> {
  readonly getOption: (s: S) => Option<A>
  readonly set: (a: A) => (s: S) => S
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Optional'
  constructor(getOption: (s: S) => Option<A>, set: (a: A) => (s: S) => S)
  /**
   * Returns an `Optional` from a nullable (`A | null | undefined`) prop
   *
   * @example
   * import { Optional } from 'monocle-ts'
   *
   * interface Phone {
   *   number: string
   * }
   * interface Employment {
   *   phone?: Phone
   * }
   * interface Info {
   *   employment?: Employment
   * }
   * interface Response {
   *   info?: Info
   * }
   *
   * const numberFromResponse = Optional.fromPath<Response>()(['info', 'employment', 'phone', 'number'])
   *
   * const response1: Response = {
   *   info: {
   *     employment: {
   *       phone: {
   *         number: '555-1234'
   *       }
   *     }
   *   }
   * }
   * const response2: Response = {
   *   info: {
   *     employment: {}
   *   }
   * }
   *
   * numberFromResponse.getOption(response1) // some('555-1234')
   * numberFromResponse.getOption(response2) // none
   *
   * @since 2.1.0
   */
  static fromPath<S>(): OptionalFromPath<S>
  /**
   * @example
   * import { Optional } from 'monocle-ts'
   *
   * interface S {
   *   a: number | undefined | null
   * }
   *
   * const optional = Optional.fromNullableProp<S>()('a')
   *
   * const s1: S = { a: undefined }
   * const s2: S = { a: null }
   * const s3: S = { a: 1 }
   *
   * assert.deepStrictEqual(optional.set(2)(s1), s1)
   * assert.deepStrictEqual(optional.set(2)(s2), s2)
   * assert.deepStrictEqual(optional.set(2)(s3), { a: 2 })
   *
   * @since 1.0.0
   */
  static fromNullableProp<S>(): <K extends keyof S>(k: K) => Optional<S, NonNullable<S[K]>>
  /**
   * Returns an `Optional` from an option (`Option<A>`) prop
   *
   * @example
   * import { Optional } from 'monocle-ts'
   * import * as O from 'fp-ts/Option'
   *
   * interface S {
   *   a: O.Option<number>
   * }
   *
   * const optional = Optional.fromOptionProp<S>()('a')
   * const s1: S = { a: O.none }
   * const s2: S = { a: O.some(1) }
   * assert.deepStrictEqual(optional.set(2)(s1), s1)
   * assert.deepStrictEqual(optional.set(2)(s2), { a: O.some(2) })
   *
   * @since 1.0.0
   */
  static fromOptionProp<S>(): <P extends OptionPropertyNames<S>>(prop: P) => Optional<S, OptionPropertyType<S, P>>
  /**
   * @since 1.0.0
   */
  modify(f: (a: A) => A): (s: S) => S
  /**
   * @since 1.0.0
   */
  modifyOption(f: (a: A) => A): (s: S) => Option<S>
  /**
   * view a `Optional` as a `Traversal`
   *
   * @since 1.0.0
   */
  asTraversal(): Traversal<S, A>
  /**
   * view an `Optional` as a `Fold`
   *
   * @since 1.0.0
   */
  asFold(): Fold<S, A>
  /**
   * view an `Optional` as a `Setter`
   *
   * @since 1.0.0
   */
  asSetter(): Setter<S, A>
  /**
   * compose a `Optional` with a `Optional`
   *
   * @since 1.0.0
   */
  compose<B>(ab: Optional<A, B>): Optional<S, B>
  /**
   * Alias of `compose`
   *
   * @since 1.0.0
   */
  composeOptional<B>(ab: Optional<A, B>): Optional<S, B>
  /**
   * compose an `Optional` with a `Traversal`
   *
   * @since 1.0.0
   */
  composeTraversal<B>(ab: Traversal<A, B>): Traversal<S, B>
  /**
   * compose an `Optional` with a `Fold`
   *
   * @since 1.0.0
   */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B>
  /**
   * compose an `Optional` with a `Setter`
   *
   * @since 1.0.0
   */
  composeSetter<B>(ab: Setter<A, B>): Setter<S, B>
  /**
   * compose an `Optional` with a `Lens`
   *
   * @since 1.0.0
   */
  composeLens<B>(ab: Lens<A, B>): Optional<S, B>
  /**
   * compose an `Optional` with a `Prism`
   *
   * @since 1.0.0
   */
  composePrism<B>(ab: Prism<A, B>): Optional<S, B>
  /**
   * compose an `Optional` with a `Iso`
   *
   * @since 1.0.0
   */
  composeIso<B>(ab: Iso<A, B>): Optional<S, B>
  /**
   * compose an `Optional` with a `Getter`
   *
   * @since 1.0.0
   */
  composeGetter<B>(ab: Getter<A, B>): Fold<S, B>
}
/**
 * @since 1.0.0
 */
export declare type ModifyF<S, A> = traversal.ModifyF<S, A>
/**
 * @category constructor
 * @since 1.0.0
 */
export declare class Traversal<S, A> {
  readonly modifyF: ModifyF<S, A>
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Traversal'
  constructor(modifyF: ModifyF<S, A>)
  /**
   * @since 1.0.0
   */
  modify(f: (a: A) => A): (s: S) => S
  /**
   * @since 1.0.0
   */
  set(a: A): (s: S) => S
  /**
   * focus the items matched by a `traversal` to those that match a predicate
   *
   * @example
   * import { fromTraversable, Lens } from 'monocle-ts'
   * import { Traversable } from 'fp-ts/Array'
   *
   * interface Person {
   *   name: string;
   *   cool: boolean;
   * }
   *
   * const peopleTraversal = fromTraversable(Traversable)<Person>()
   * const coolLens = Lens.fromProp<Person>()('cool')
   * const people = [{name: 'bill', cool: false}, {name: 'jill', cool: true}]
   *
   * const actual = peopleTraversal.filter(p => p.name === 'bill').composeLens(coolLens)
   *   .set(true)(people)
   *
   * assert.deepStrictEqual(actual, [{name: 'bill', cool: true}, {name: 'jill', cool: true}])
   *
   * @since 1.0.0
   */
  filter<B extends A>(refinement: Refinement<A, B>): Traversal<S, B>
  filter(predicate: Predicate<A>): Traversal<S, A>
  /**
   * view a `Traversal` as a `Fold`
   *
   * @since 1.0.0
   */
  asFold(): Fold<S, A>
  /**
   * view a `Traversal` as a `Setter`
   *
   * @since 1.0.0
   */
  asSetter(): Setter<S, A>
  /**
   * compose a `Traversal` with a `Traversal`
   *
   * @since 1.0.0
   */
  compose<B>(ab: Traversal<A, B>): Traversal<S, B>
  /**
   * Alias of `compose`
   *
   * @since 1.0.0
   */
  composeTraversal<B>(ab: Traversal<A, B>): Traversal<S, B>
  /**
   * compose a `Traversal` with a `Fold`
   *
   * @since 1.0.0
   */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B>
  /**
   * compose a `Traversal` with a `Setter`
   *
   * @since 1.0.0
   */
  composeSetter<B>(ab: Setter<A, B>): Setter<S, B>
  /**
   * compose a `Traversal` with a `Optional`
   *
   * @since 1.0.0
   */
  composeOptional<B>(ab: Optional<A, B>): Traversal<S, B>
  /**
   * compose a `Traversal` with a `Lens`
   *
   * @since 1.0.0
   */
  composeLens<B>(ab: Lens<A, B>): Traversal<S, B>
  /**
   * compose a `Traversal` with a `Prism`
   *
   * @since 1.0.0
   */
  composePrism<B>(ab: Prism<A, B>): Traversal<S, B>
  /**
   * compose a `Traversal` with a `Iso`
   *
   * @since 1.0.0
   */
  composeIso<B>(ab: Iso<A, B>): Traversal<S, B>
  /**
   * compose a `Traversal` with a `Getter`
   *
   * @since 1.0.0
   */
  composeGetter<B>(ab: Getter<A, B>): Fold<S, B>
}
/**
 * @category constructor
 * @since 1.2.0
 */
export declare class At<S, I, A> {
  readonly at: (i: I) => Lens<S, A>
  /**
   * @since 1.0.0
   */
  readonly _tag: 'At'
  constructor(at: (i: I) => Lens<S, A>)
  /**
   * lift an instance of `At` using an `Iso`
   *
   * @since 1.2.0
   */
  fromIso<T>(iso: Iso<T, S>): At<T, I, A>
}
/**
 * @category constructor
 * @since 1.2.0
 */
export declare class Index<S, I, A> {
  readonly index: (i: I) => Optional<S, A>
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Index'
  constructor(index: (i: I) => Optional<S, A>)
  /**
   * @since 1.2.0
   */
  static fromAt<T, J, B>(at: At<T, J, Option<B>>): Index<T, J, B>
  /**
   * lift an instance of `Index` using an `Iso`
   *
   * @since 1.2.0
   */
  fromIso<T>(iso: Iso<T, S>): Index<T, I, A>
}
/**
 * @category constructor
 * @since 1.0.0
 */
export declare class Getter<S, A> {
  readonly get: (s: S) => A
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Getter'
  constructor(get: (s: S) => A)
  /**
   * view a `Getter` as a `Fold`
   *
   * @since 1.0.0
   */
  asFold(): Fold<S, A>
  /**
   * compose a `Getter` with a `Getter`
   *
   * @since 1.0.0
   */
  compose<B>(ab: Getter<A, B>): Getter<S, B>
  /**
   * Alias of `compose`
   *
   * @since 1.0.0
   */
  composeGetter<B>(ab: Getter<A, B>): Getter<S, B>
  /**
   * compose a `Getter` with a `Fold`
   *
   * @since 1.0.0
   */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B>
  /**
   * compose a `Getter` with a `Lens`
   *
   * @since 1.0.0
   */
  composeLens<B>(ab: Lens<A, B>): Getter<S, B>
  /**
   * compose a `Getter` with a `Iso`
   *
   * @since 1.0.0
   */
  composeIso<B>(ab: Iso<A, B>): Getter<S, B>
  /**
   * compose a `Getter` with a `Optional`
   *
   * @since 1.0.0
   */
  composeTraversal<B>(ab: Traversal<A, B>): Fold<S, B>
  /**
   * compose a `Getter` with a `Optional`
   *
   * @since 1.0.0
   */
  composeOptional<B>(ab: Optional<A, B>): Fold<S, B>
  /**
   * compose a `Getter` with a `Prism`
   *
   * @since 1.0.0
   */
  composePrism<B>(ab: Prism<A, B>): Fold<S, B>
}
/**
 * @category constructor
 * @since 1.0.0
 */
export declare class Fold<S, A> {
  readonly foldMap: <M>(M: Monoid<M>) => (f: (a: A) => M) => (s: S) => M
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Fold'
  /**
   * get all the targets of a `Fold`
   *
   * @since 1.0.0
   */
  readonly getAll: (s: S) => Array<A>
  /**
   * check if at least one target satisfies the predicate
   *
   * @since 1.0.0
   */
  readonly exist: (p: Predicate<A>) => Predicate<S>
  /**
   * check if all targets satisfy the predicate
   *
   * @since 1.0.0
   */
  readonly all: (p: Predicate<A>) => Predicate<S>
  private readonly foldMapFirst
  constructor(foldMap: <M>(M: Monoid<M>) => (f: (a: A) => M) => (s: S) => M)
  /**
   * compose a `Fold` with a `Fold`
   *
   * @since 1.0.0
   */
  compose<B>(ab: Fold<A, B>): Fold<S, B>
  /**
   * Alias of `compose`
   *
   * @since 1.0.0
   */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B>
  /**
   * compose a `Fold` with a `Getter`
   *
   * @since 1.0.0
   */
  composeGetter<B>(ab: Getter<A, B>): Fold<S, B>
  /**
   * compose a `Fold` with a `Traversal`
   *
   * @since 1.0.0
   */
  composeTraversal<B>(ab: Traversal<A, B>): Fold<S, B>
  /**
   * compose a `Fold` with a `Optional`
   *
   * @since 1.0.0
   */
  composeOptional<B>(ab: Optional<A, B>): Fold<S, B>
  /**
   * compose a `Fold` with a `Lens`
   *
   * @since 1.0.0
   */
  composeLens<B>(ab: Lens<A, B>): Fold<S, B>
  /**
   * compose a `Fold` with a `Prism`
   *
   * @since 1.0.0
   */
  composePrism<B>(ab: Prism<A, B>): Fold<S, B>
  /**
   * compose a `Fold` with a `Iso`
   *
   * @since 1.0.0
   */
  composeIso<B>(ab: Iso<A, B>): Fold<S, B>
  /**
   * find the first target of a `Fold` matching the predicate
   *
   * @since 1.0.0
   */
  find<B extends A>(p: Refinement<A, B>): (s: S) => Option<B>
  find(p: Predicate<A>): (s: S) => Option<A>
  /**
   * get the first target of a `Fold`
   *
   * @since 1.0.0
   */
  headOption(s: S): Option<A>
}
/**
 * @category constructor
 * @since 1.0.0
 */
export declare class Setter<S, A> {
  readonly modify: (f: (a: A) => A) => (s: S) => S
  /**
   * @since 1.0.0
   */
  readonly _tag: 'Setter'
  constructor(modify: (f: (a: A) => A) => (s: S) => S)
  /**
   * @since 1.0.0
   */
  set(a: A): (s: S) => S
  /**
   * compose a `Setter` with a `Setter`
   *
   * @since 1.0.0
   */
  compose<B>(ab: Setter<A, B>): Setter<S, B>
  /**
   * Alias of `compose`
   *
   * @since 1.0.0
   */
  composeSetter<B>(ab: Setter<A, B>): Setter<S, B>
  /**
   * compose a `Setter` with a `Traversal`
   *
   * @since 1.0.0
   */
  composeTraversal<B>(ab: Traversal<A, B>): Setter<S, B>
  /**
   * compose a `Setter` with a `Optional`
   *
   * @since 1.0.0
   */
  composeOptional<B>(ab: Optional<A, B>): Setter<S, B>
  /**
   * compose a `Setter` with a `Lens`
   *
   * @since 1.0.0
   */
  composeLens<B>(ab: Lens<A, B>): Setter<S, B>
  /**
   * compose a `Setter` with a `Prism`
   *
   * @since 1.0.0
   */
  composePrism<B>(ab: Prism<A, B>): Setter<S, B>
  /**
   * compose a `Setter` with a `Iso`
   *
   * @since 1.0.0
   */
  composeIso<B>(ab: Iso<A, B>): Setter<S, B>
}
/**
 * Create a `Traversal` from a `Traversable`
 *
 * @example
 * import { Lens, fromTraversable } from 'monocle-ts'
 * import { Traversable } from 'fp-ts/Array'
 *
 * interface Tweet {
 *   text: string
 * }
 *
 * interface Tweets {
 *   tweets: Tweet[]
 * }
 *
 * const tweetsLens = Lens.fromProp<Tweets>()('tweets')
 * const tweetTextLens = Lens.fromProp<Tweet>()('text')
 * const tweetTraversal = fromTraversable(Traversable)<Tweet>()
 * const composedTraversal = tweetsLens.composeTraversal(tweetTraversal).composeLens(tweetTextLens)
 *
 * const tweet1: Tweet = { text: 'hello world' }
 * const tweet2: Tweet = { text: 'foobar' }
 * const model: Tweets = { tweets: [tweet1, tweet2] }
 *
 * const actual = composedTraversal.modify(text =>
 *   text
 *     .split('')
 *     .reverse()
 *     .join('')
 * )(model)
 *
 * assert.deepStrictEqual(actual, { tweets: [ { text: 'dlrow olleh' }, { text: 'raboof' } ] })
 *
 * @category constructor
 * @since 1.0.0
 */
export declare function fromTraversable<T extends URIS3>(
  T: Traversable3<T>
): <U, L, A>() => Traversal<Kind3<T, U, L, A>, A>
export declare function fromTraversable<T extends URIS2>(T: Traversable2<T>): <L, A>() => Traversal<Kind2<T, L, A>, A>
export declare function fromTraversable<T extends URIS>(T: Traversable1<T>): <A>() => Traversal<Kind<T, A>, A>
export declare function fromTraversable<T>(T: Traversable<T>): <A>() => Traversal<HKT<T, A>, A>
/**
 * Create a `Fold` from a `Foldable`
 *
 * @category constructor
 * @since 1.0.0
 */
export declare function fromFoldable<F extends URIS3>(F: Foldable3<F>): <U, L, A>() => Fold<Kind3<F, U, L, A>, A>
export declare function fromFoldable<F extends URIS2>(F: Foldable2<F>): <L, A>() => Fold<Kind2<F, L, A>, A>
export declare function fromFoldable<F extends URIS>(F: Foldable1<F>): <A>() => Fold<Kind<F, A>, A>
export declare function fromFoldable<F>(F: Foldable<F>): <A>() => Fold<HKT<F, A>, A>
