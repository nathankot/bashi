import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
import { transformArguments as transformXClaimArguments } from './XCLAIM.d.ts';
export { FIRST_KEY_INDEX } from './XCLAIM.d.ts';
export declare function transformArguments(...args: Parameters<typeof transformXClaimArguments>): RedisCommandArguments;
export declare function transformReply(): Array<RedisCommandArgument>;
