/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.3.0
 */
import * as O from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Option/lib/index.d.ts'
import { At } from './At.d.ts'
import { Iso } from './Iso.d.ts'
import { Optional } from './Optional.d.ts'
import { Eq } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Eq/lib/index.d.ts'
import Option = O.Option
import { ReadonlyRecord } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/ReadonlyRecord/lib/index.d.ts'
import { ReadonlyNonEmptyArray } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/ReadonlyNonEmptyArray/lib/index.d.ts'
/**
 * @category model
 * @since 2.3.0
 */
export interface Index<S, I, A> {
  readonly index: (i: I) => Optional<S, A>
}
/**
 * @category constructors
 * @since 2.3.8
 */
export declare const index: <S, I, A>(index: Index<S, I, A>['index']) => Index<S, I, A>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const fromAt: <T, J, B>(at: At<T, J, O.Option<B>>) => Index<T, J, B>
/**
 * Lift an instance of `Index` using an `Iso`.
 *
 * @category constructors
 * @since 2.3.0
 */
export declare const fromIso: <T, S>(iso: Iso<T, S>) => <I, A>(sia: Index<S, I, A>) => Index<T, I, A>
/**
 * @category constructors
 * @since 2.3.7
 */
export declare const indexReadonlyArray: <A = never>() => Index<ReadonlyArray<A>, number, A>
/**
 * @category constructors
 * @since 2.3.8
 */
export declare const indexReadonlyNonEmptyArray: <A = never>() => Index<ReadonlyNonEmptyArray<A>, number, A>
/**
 * @category constructors
 * @since 2.3.7
 */
export declare const indexReadonlyRecord: <A = never>() => Index<ReadonlyRecord<string, A>, string, A>
/**
 * @category constructors
 * @since 2.3.7
 */
export declare const indexReadonlyMap: <K>(E: Eq<K>) => <A = never>() => Index<ReadonlyMap<K, A>, K, A>
/**
 * Use `indexReadonlyArray` instead.
 *
 * @category constructors
 * @since 2.3.2
 * @deprecated
 */
export declare const indexArray: <A = never>() => Index<ReadonlyArray<A>, number, A>
/**
 * Use `indexReadonlyRecord` instead.
 *
 * @category constructors
 * @since 2.3.2
 * @deprecated
 */
export declare const indexRecord: <A = never>() => Index<ReadonlyRecord<string, A>, string, A>
