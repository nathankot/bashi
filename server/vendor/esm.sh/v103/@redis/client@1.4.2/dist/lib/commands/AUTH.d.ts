import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export interface AuthOptions {
    username?: RedisCommandArgument;
    password: RedisCommandArgument;
}
export declare function transformArguments({ username, password }: AuthOptions): RedisCommandArguments;
export declare function transformReply(): RedisCommandArgument;
