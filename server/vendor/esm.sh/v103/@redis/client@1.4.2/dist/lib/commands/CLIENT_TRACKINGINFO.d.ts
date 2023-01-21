import { RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(): RedisCommandArguments;
declare type RawReply = [
    'flags',
    Array<string>,
    'redirect',
    number,
    'prefixes',
    Array<string>
];
interface Reply {
    flags: Set<string>;
    redirect: number;
    prefixes: Array<string>;
}
export declare function transformReply(reply: RawReply): Reply;
export {};
