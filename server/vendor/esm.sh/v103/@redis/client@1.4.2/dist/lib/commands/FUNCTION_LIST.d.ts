import { RedisCommandArguments } from './index.d.ts';
import { FunctionListItemReply, FunctionListRawItemReply } from './generic-transformers.d.ts';
export declare function transformArguments(pattern?: string): RedisCommandArguments;
export declare function transformReply(reply: Array<FunctionListRawItemReply>): Array<FunctionListItemReply>;
