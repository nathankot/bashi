import { RedisCommandArguments } from './index.d.ts';
export declare function transformArguments(sha1: string | Array<string>): RedisCommandArguments;
export { transformBooleanArrayReply as transformReply } from './generic-transformers.d.ts';
