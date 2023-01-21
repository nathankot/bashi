import { RedisCommandArgument, RedisCommandArguments } from './index.d.ts';
declare type SingleParameter = [parameter: RedisCommandArgument, value: RedisCommandArgument];
declare type MultipleParameters = [config: Record<string, RedisCommandArgument>];
export declare function transformArguments(...[parameterOrConfig, value]: SingleParameter | MultipleParameters): RedisCommandArguments;
export declare function transformReply(): string;
export {};