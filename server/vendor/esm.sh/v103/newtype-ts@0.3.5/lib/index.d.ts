/**
 * @since 0.2.0
 */
import { Field } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Field/lib/index.d.ts';
import { Predicate } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/function/lib/index.d.ts';
import { Monoid } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Monoid/lib/index.d.ts';
import { Ord } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Ord/lib/index.d.ts';
import { Ring } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Ring/lib/index.d.ts';
import { Semigroup } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Semigroup/lib/index.d.ts';
import { Semiring } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Semiring/lib/index.d.ts';
import { Eq } from 'https://esm.sh/v103/fp-ts@2.13.1/lib/Eq/lib/index.d.ts';
import { Iso, Prism } from 'https://esm.sh/v103/monocle-ts@2.3.13/lib/index.d.ts';
/**
 * @since 0.2.0
 */
export interface Newtype<URI, A> {
    readonly _URI: URI;
    readonly _A: A;
}
/**
 * @since 0.2.0
 */
export declare type AnyNewtype = Newtype<any, any>;
/**
 * @since 0.2.0
 */
export declare type URIOf<N extends AnyNewtype> = N['_URI'];
/**
 * @since 0.2.0
 */
export declare type CarrierOf<N extends AnyNewtype> = N['_A'];
/**
 * @since 0.3.0
 */
export declare const getEq: <S extends Newtype<any, any>>(S: Eq<S["_A"]>) => Eq<S>;
/**
 * @since 0.2.0
 */
export declare const getOrd: <S extends Newtype<any, any>>(O: Ord<S["_A"]>) => Ord<S>;
/**
 * @since 0.2.0
 */
export declare const getSemigroup: <S extends Newtype<any, any>>(S: Semigroup<S["_A"]>) => Semigroup<S>;
/**
 * @since 0.2.0
 */
export declare const getMonoid: <S extends Newtype<any, any>>(M: Monoid<S["_A"]>) => Monoid<S>;
/**
 * @since 0.2.0
 */
export declare const getSemiring: <S extends Newtype<any, any>>(S: Semiring<S["_A"]>) => Semiring<S>;
/**
 * @since 0.2.0
 */
export declare const getRing: <S extends Newtype<any, any>>(R: Ring<S["_A"]>) => Ring<S>;
/**
 * @since 0.2.0
 */
export declare const getField: <S extends Newtype<any, any>>(F: Field<S["_A"]>) => Field<S>;
/**
 * @since 0.2.0
 */
export declare function iso<S extends AnyNewtype>(): Iso<S, CarrierOf<S>>;
/**
 * @since 0.2.0
 */
export interface Concat<N1 extends Newtype<object, any>, N2 extends Newtype<object, CarrierOf<N1>>> extends Newtype<URIOf<N1> & URIOf<N2>, CarrierOf<N1>> {
}
/**
 * @since 0.2.0
 */
export interface Extends<N extends AnyNewtype, Tags extends object> extends Newtype<Tags & URIOf<N>, CarrierOf<N>> {
}
/**
 * @since 0.2.0
 */
export declare function prism<S extends AnyNewtype>(predicate: Predicate<CarrierOf<S>>): Prism<CarrierOf<S>, S>;
