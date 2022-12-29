import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { ListSide } from './generic-transformers.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(source: RedisCommandArgument, destination: RedisCommandArgument, sourceDirection: ListSide, destinationDirection: ListSide, timeout: number): RedisCommandArguments;
export declare function transformReply(): RedisCommandArgument | null;
