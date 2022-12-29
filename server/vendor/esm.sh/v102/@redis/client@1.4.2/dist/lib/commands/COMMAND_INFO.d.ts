import { RedisCommandArguments } from './index.d.ts';
import { CommandRawReply, CommandReply } from './generic-transformers.d.ts';
export declare const IS_READ_ONLY = true;
export declare function transformArguments(commands: Array<string>): RedisCommandArguments;
export declare function transformReply(reply: Array<CommandRawReply | null>): Array<CommandReply | null>;
