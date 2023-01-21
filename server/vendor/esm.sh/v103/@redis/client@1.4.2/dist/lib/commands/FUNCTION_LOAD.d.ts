import { RedisCommandArguments } from './index.d.ts';
interface FunctionLoadOptions {
    REPLACE?: boolean;
}
export declare function transformArguments(code: string, options?: FunctionLoadOptions): RedisCommandArguments;
export declare function transformReply(): string;
export {};
