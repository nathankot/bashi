/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.3.0
 */
import { Eq } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Eq/lib/index.d.ts'
import * as O from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Option/lib/index.d.ts'
import { ReadonlyRecord } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/ReadonlyRecord/lib/index.d.ts'
import { Iso } from './Iso.d.ts'
import { Lens } from './Lens.d.ts'
import Option = O.Option
/**
 * @category model
 * @since 2.3.0
 */
export interface At<S, I, A> {
  readonly at: (i: I) => Lens<S, A>
}
/**
 * @category constructors
 * @since 2.3.8
 */
export declare const at: <S, I, A>(at: At<S, I, A>['at']) => At<S, I, A>
/**
 * Lift an instance of `At` using an `Iso`.
 *
 * @category constructors
 * @since 2.3.0
 */
export declare const fromIso: <T, S>(iso: Iso<T, S>) => <I, A>(sia: At<S, I, A>) => At<T, I, A>
/**
 * @category constructors
 * @since 2.3.7
 */
export declare const atReadonlyRecord: <A = never>() => At<ReadonlyRecord<string, A>, string, Option<A>>
/**
 * @category constructors
 * @since 2.3.7
 */
export declare const atReadonlyMap: <K>(E: Eq<K>) => <A = never>() => At<ReadonlyMap<K, A>, K, O.Option<A>>
/**
 * @category constructors
 * @since 2.3.7
 */
export declare const atReadonlySet: <A>(E: Eq<A>) => At<ReadonlySet<A>, A, boolean>
/**
 * Use `atReadonlyRecord` instead.
 *
 * @category constructors
 * @since 2.3.2
 * @deprecated
 */
export declare const atRecord: <A = never>() => At<ReadonlyRecord<string, A>, string, Option<A>>
