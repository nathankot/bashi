import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(categoryName?: RedisCommandArgument): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
