import { RedisCommandArguments } from './index.d.ts';
import { SlotRange } from './generic-transformers.d.ts';
export declare function transformArguments(ranges: SlotRange | Array<SlotRange>): RedisCommandArguments;
export declare function transformReply(): 'OK';
