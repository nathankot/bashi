import { RedisCommandArguments } from './index.d.ts';
import { MSetArguments } from './MSET.d.ts';
export declare const FIRST_KEY_INDEX = 1;
export declare function transformArguments(toSet: MSetArguments): RedisCommandArguments;
export { transformBooleanReply as transformReply } from './generic-transformers.d.ts';
