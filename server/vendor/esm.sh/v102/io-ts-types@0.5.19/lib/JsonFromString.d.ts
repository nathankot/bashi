/**
 * @since 0.5.14
 */
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * Copied from `fp-ts/Either` module.
 *
 * @since 0.5.14
 */
export declare type Json = boolean | number | string | null | JsonArray | JsonRecord
/**
 * @since 0.5.14
 */
export interface JsonRecord {
  readonly [key: string]: Json
}
/**
 * @since 0.5.14
 */
export interface JsonArray extends ReadonlyArray<Json> {}
/**
 * @since 0.5.15
 */
export declare const JsonArray: t.Type<JsonArray>
/**
 * @since 0.5.15
 */
export declare const JsonRecord: t.Type<JsonRecord>
/**
 * @since 0.5.15
 */
export declare const Json: t.Type<Json>
/**
 * @since 0.5.14
 */
export declare const JsonFromString: t.Type<Json, string, string>
