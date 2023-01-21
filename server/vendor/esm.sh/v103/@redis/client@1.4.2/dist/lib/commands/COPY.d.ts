import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
interface CopyCommandOptions {
    destinationDb?: number;
    replace?: boolean;
}
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(source: RedisCommandArgument, destination: RedisCommandArgument, options?: CopyCommandOptions): RedisCommandArguments;
export { transformBooleanReply as transformReply } from './generic-transformers.d.ts';
