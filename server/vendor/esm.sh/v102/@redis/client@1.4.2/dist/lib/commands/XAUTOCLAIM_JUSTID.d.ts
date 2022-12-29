import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { transformArguments as transformXAutoClaimArguments } from './XAUTOCLAIM.d.ts';
export { FIRST_KEY_INDEX } from './XAUTOCLAIM.d.ts';
export declare function transformArguments(...args: Parameters<typeof transformXAutoClaimArguments>): RedisCommandArguments;
declare type XAutoClaimJustIdRawReply = [RedisCommandArgument, Array<RedisCommandArgument>];
interface XAutoClaimJustIdReply {
    nextId: RedisCommandArgument;
    messages: Array<RedisCommandArgument>;
}
export declare function transformReply(reply: XAutoClaimJustIdRawReply): XAutoClaimJustIdReply;
