/**
 * @since 2.0.0
 */
import { ApplicativeComposition12C, ApplicativeComposition22C, ApplicativeCompositionHKT2C } from './Applicative.d.ts'
import * as E from './Either.d.ts'
import { Lazy } from './function.d.ts'
import { HKT, Kind, Kind2, URIS, URIS2 } from './HKT/HKT.d.ts'
import { Monad, Monad1, Monad2 } from './Monad.d.ts'
import { Semigroup } from './Semigroup.d.ts'
import Either = E.Either
/**
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export interface ValidationT<M, E, A> extends HKT<M, Either<E, A>> {}
/**
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export interface ValidationM<M, E> extends ApplicativeCompositionHKT2C<M, E.URI, E> {
  readonly chain: <A, B>(ma: ValidationT<M, E, A>, f: (a: A) => ValidationT<M, E, B>) => ValidationT<M, E, B>
  readonly alt: <A>(fa: ValidationT<M, E, A>, that: Lazy<ValidationT<M, E, A>>) => ValidationT<M, E, A>
}
/**
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export declare type ValidationT1<M extends URIS, E, A> = Kind<M, Either<E, A>>
/**
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export interface ValidationM1<M extends URIS, E> extends ApplicativeComposition12C<M, E.URI, E> {
  readonly chain: <A, B>(ma: ValidationT1<M, E, A>, f: (a: A) => ValidationT1<M, E, B>) => ValidationT1<M, E, B>
  readonly alt: <A>(fa: ValidationT1<M, E, A>, that: Lazy<ValidationT1<M, E, A>>) => ValidationT1<M, E, A>
}
/**
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export declare type ValidationT2<M extends URIS2, R, E, A> = Kind2<M, R, Either<E, A>>
/**
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export interface ValidationM2<M extends URIS2, E> extends ApplicativeComposition22C<M, E.URI, E> {
  readonly chain: <R, A, B>(
    ma: ValidationT2<M, R, E, A>,
    f: (a: A) => ValidationT2<M, R, E, B>
  ) => ValidationT2<M, R, E, B>
  readonly alt: <R, A>(fa: ValidationT2<M, R, E, A>, that: Lazy<ValidationT2<M, R, E, A>>) => ValidationT2<M, R, E, A>
}
/**
 * Use `EitherT` instead.
 *
 * @category zone of death
 * @since 2.0.0
 * @deprecated
 */
export declare function getValidationM<E, M extends URIS2>(S: Semigroup<E>, M: Monad2<M>): ValidationM2<M, E>
/** @deprecated */
export declare function getValidationM<E, M extends URIS>(S: Semigroup<E>, M: Monad1<M>): ValidationM1<M, E>
/** @deprecated */
export declare function getValidationM<E, M>(S: Semigroup<E>, M: Monad<M>): ValidationM<M, E>
