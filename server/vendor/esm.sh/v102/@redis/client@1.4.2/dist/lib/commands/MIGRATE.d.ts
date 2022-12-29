import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { AuthOptions } from './AUTH.d.ts';
interface MigrateOptions {
    COPY?: true;
    REPLACE?: true;
    AUTH?: AuthOptions;
}
export declare function transformArguments(host: RedisCommandArgument, port: number, key: RedisCommandArgument | Array<RedisCommandArgument>, destinationDb: number, timeout: number, options?: MigrateOptions): RedisCommandArguments;
export declare function transformReply(): string;
export {};
