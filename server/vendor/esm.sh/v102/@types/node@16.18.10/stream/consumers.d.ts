/// <reference path="https://esm.sh/v102/node.ns.d.ts" />
declare module 'stream/consumers' {
    import { Readable } from 'https://esm.sh/v102/@types/node@16.18.10/stream.d.ts';
    import { Blob as NodeBlob } from "https://esm.sh/v102/@types/node@16.18.10/buffer.d.ts";
    function buffer(stream: NodeJS.ReadableStream | Readable | AsyncIterator<any>): Promise<Buffer>;
    function text(stream: NodeJS.ReadableStream | Readable | AsyncIterator<any>): Promise<string>;
    function arrayBuffer(stream: NodeJS.ReadableStream | Readable | AsyncIterator<any>): Promise<ArrayBuffer>;
    function blob(stream: NodeJS.ReadableStream | Readable | AsyncIterator<any>): Promise<NodeBlob>;
    function json(stream: NodeJS.ReadableStream | Readable | AsyncIterator<any>): Promise<unknown>;
}
declare module 'https://esm.sh/v102/@types/node@16.18.10/stream/consumers.d.ts' {
    export * from 'stream/consumers';
}
