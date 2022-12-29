import { ParsedResult, ParsingOption } from "../../index.d.ts";
import { Chrono, Configuration } from "../../chrono.d.ts";
export declare const casual: Chrono;
export declare const strict: Chrono;
export declare const GB: Chrono;
export declare function parse(text: string, ref?: Date, option?: ParsingOption): ParsedResult[];
export declare function parseDate(text: string, ref?: Date, option?: ParsingOption): Date;
export declare function createCasualConfiguration(littleEndian?: boolean): Configuration;
export declare function createConfiguration(strictMode?: boolean, littleEndian?: boolean): Configuration;
