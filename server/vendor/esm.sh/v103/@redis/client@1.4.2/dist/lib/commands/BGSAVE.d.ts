import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
interface BgSaveOptions {
    SCHEDULE?: true;
}
export declare function transformArguments(options?: BgSaveOptions): RedisCommandArguments;
export declare function transformReply(): RedisCommandArgument;
export {};
