import * as en from "./locales/en/index.d.ts";
import { Chrono, Parser, Refiner } from "./chrono.d.ts";
export { en, Chrono, Parser, Refiner };
export interface ParsingOption {
    forwardDate?: boolean;
    timezones?: {
        [tzKeyword: string]: number;
    };
}
export interface ParsingReference {
    instant?: Date;
    timezone?: string | number;
}
export interface ParsedResult {
    readonly refDate: Date;
    readonly index: number;
    readonly text: string;
    readonly start: ParsedComponents;
    readonly end?: ParsedComponents;
    date(): Date;
}
export interface ParsedComponents {
    isCertain(component: Component): boolean;
    get(component: Component): number | null;
    date(): Date;
}
export declare type Component = "year" | "month" | "day" | "weekday" | "hour" | "minute" | "second" | "millisecond" | "meridiem" | "timezoneOffset";
export declare enum Meridiem {
    AM = 0,
    PM = 1
}
export declare enum Weekday {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6
}
import * as de from "./locales/de/index.d.ts";
import * as fr from "./locales/fr/index.d.ts";
import * as ja from "./locales/ja/index.d.ts";
import * as pt from "./locales/pt/index.d.ts";
import * as nl from "./locales/nl/index.d.ts";
import * as zh from "./locales/zh/index.d.ts";
import * as ru from "./locales/ru/index.d.ts";
export { de, fr, ja, pt, nl, zh, ru };
export declare const strict: Chrono;
export declare const casual: Chrono;
export declare function parse(text: string, ref?: ParsingReference | Date, option?: ParsingOption): ParsedResult[];
export declare function parseDate(text: string, ref?: ParsingReference | Date, option?: ParsingOption): Date;
