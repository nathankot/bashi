/// <reference path="https://esm.sh/v103/node.ns.d.ts" />
/**
 * `Buffer` objects are used to represent a fixed-length sequence of bytes. Many
 * Node.js APIs support `Buffer`s.
 *
 * The `Buffer` class is a subclass of JavaScript's [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) class and
 * extends it with methods that cover additional use cases. Node.js APIs accept
 * plain [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) s wherever `Buffer`s are supported as well.
 *
 * While the `Buffer` class is available within the global scope, it is still
 * recommended to explicitly reference it via an import or require statement.
 *
 * ```js
 * import { Buffer } from 'buffer';
 *
 * // Creates a zero-filled Buffer of length 10.
 * const buf1 = Buffer.alloc(10);
 *
 * // Creates a Buffer of length 10,
 * // filled with bytes which all have the value `1`.
 * const buf2 = Buffer.alloc(10, 1);
 *
 * // Creates an uninitialized buffer of length 10.
 * // This is faster than calling Buffer.alloc() but the returned
 * // Buffer instance might contain old data that needs to be
 * // overwritten using fill(), write(), or other functions that fill the Buffer's
 * // contents.
 * const buf3 = Buffer.allocUnsafe(10);
 *
 * // Creates a Buffer containing the bytes [1, 2, 3].
 * const buf4 = Buffer.from([1, 2, 3]);
 *
 * // Creates a Buffer containing the bytes [1, 1, 1, 1] – the entries
 * // are all truncated using `(value &#x26; 255)` to fit into the range 0–255.
 * const buf5 = Buffer.from([257, 257.5, -255, '1']);
 *
 * // Creates a Buffer containing the UTF-8-encoded bytes for the string 'tést':
 * // [0x74, 0xc3, 0xa9, 0x73, 0x74] (in hexadecimal notation)
 * // [116, 195, 169, 115, 116] (in decimal notation)
 * const buf6 = Buffer.from('tést');
 *
 * // Creates a Buffer containing the Latin-1 bytes [0x74, 0xe9, 0x73, 0x74].
 * const buf7 = Buffer.from('tést', 'latin1');
 * ```
 * @see [source](https://github.com/nodejs/node/blob/v16.9.0/lib/buffer.js)
 */
declare module 'buffer' {
    import { BinaryLike } from 'https://esm.sh/v103/@types/node@16.18.10/crypto.d.ts';
    import { ReadableStream as WebReadableStream } from 'https://esm.sh/v103/@types/node@16.18.10/stream/web.d.ts';
    export const INSPECT_MAX_BYTES: number;
    export const kMaxLength: number;
    export const kStringMaxLength: number;
    export const constants: {
        MAX_LENGTH: number;
        MAX_STRING_LENGTH: number;
    };
    export type TranscodeEncoding = 'ascii' | 'utf8' | 'utf16le' | 'ucs2' | 'latin1' | 'binary';
    /**
     * Re-encodes the given `Buffer` or `Uint8Array` instance from one character
     * encoding to another. Returns a new `Buffer` instance.
     *
     * Throws if the `fromEnc` or `toEnc` specify invalid character encodings or if
     * conversion from `fromEnc` to `toEnc` is not permitted.
     *
     * Encodings supported by `buffer.transcode()` are: `'ascii'`, `'utf8'`,`'utf16le'`, `'ucs2'`, `'latin1'`, and `'binary'`.
     *
     * The transcoding process will use substitution characters if a given byte
     * sequence cannot be adequately represented in the target encoding. For instance:
     *
     * ```js
     * import { Buffer, transcode } from 'buffer';
     *
     * const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
     * console.log(newBuf.toString('ascii'));
     * // Prints: '?'
     * ```
     *
     * Because the Euro (`€`) sign is not representable in US-ASCII, it is replaced
     * with `?` in the transcoded `Buffer`.
     * @since v7.1.0
     * @param source A `Buffer` or `Uint8Array` instance.
     * @param fromEnc The current encoding.
     * @param toEnc To target encoding.
     */
    export function transcode(source: Uint8Array, fromEnc: TranscodeEncoding, toEnc: TranscodeEncoding): Buffer;
    export const SlowBuffer: {
        /** @deprecated since v6.0.0, use `Buffer.allocUnsafeSlow()` */
        new (size: number): Buffer;
        prototype: Buffer;
    };
    /**
     * Resolves a `'blob:nodedata:...'` an associated `Blob` object registered using
     * a prior call to `URL.createObjectURL()`.
     * @since v16.7.0
     * @experimental
     * @param id A `'blob:nodedata:...` URL string returned by a prior call to `URL.createObjectURL()`.
     */
    export function resolveObjectURL(id: string): Blob | undefined;
    export const Buffer: Buffer;
    /**
     * @experimental
     */
    export interface BlobOptions {
        /**
         * @default 'utf8'
         */
        encoding?: BufferEncoding | undefined;
        /**
         * The Blob content-type. The intent is for `type` to convey
         * the MIME media type of the data, however no validation of the type format
         * is performed.
         */
        type?: string | undefined;
    }
    /**
     * A [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) encapsulates immutable, raw data that can be safely shared across
     * multiple worker threads.
     * @since v15.7.0
     * @experimental
     */
    export class Blob {
        /**
         * The total size of the `Blob` in bytes.
         * @since v15.7.0
         */
        readonly size: number;
        /**
         * The content-type of the `Blob`.
         * @since v15.7.0
         */
        readonly type: string;
        /**
         * Creates a new `Blob` object containing a concatenation of the given sources.
         *
         * {ArrayBuffer}, {TypedArray}, {DataView}, and {Buffer} sources are copied into
         * the 'Blob' and can therefore be safely modified after the 'Blob' is created.
         *
         * String sources are also copied into the `Blob`.
         */
        constructor(sources: Array<BinaryLike | Blob>, options?: BlobOptions);
        /**
         * Returns a promise that fulfills with an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) containing a copy of
         * the `Blob` data.
         * @since v15.7.0
         */
        arrayBuffer(): Promise<ArrayBuffer>;
        /**
         * Creates and returns a new `Blob` containing a subset of this `Blob` objects
         * data. The original `Blob` is not altered.
         * @since v15.7.0
         * @param start The starting index.
         * @param end The ending index.
         * @param type The content-type for the new `Blob`
         */
        slice(start?: number, end?: number, type?: string): Blob;
        /**
         * Returns a promise that fulfills with the contents of the `Blob` decoded as a
         * UTF-8 string.
         * @since v15.7.0
         */
        text(): Promise<string>;
        /**
         * Returns a new (WHATWG) `ReadableStream` that allows the content of the `Blob` to be read.
         * @since v16.7.0
         */
        stream(): WebReadableStream;
    }
    export import atob = globalThis.atob;
    export import btoa = globalThis.btoa;
    
}
declare module 'https://esm.sh/v103/@types/node@16.18.10/buffer.d.ts' {
    export * from 'buffer';
}
