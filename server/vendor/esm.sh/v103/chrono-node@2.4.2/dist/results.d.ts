import { Component, ParsedComponents, ParsedResult, ParsingReference } from "./index.d.ts";
import dayjs, { QUnitType } from "https://esm.sh/v103/dayjs@1.11.7/index.d.ts";
export declare class ReferenceWithTimezone {
    readonly instant: Date;
    readonly timezoneOffset?: number | null;
    constructor(input?: ParsingReference | Date);
    getDateWithAdjustedTimezone(): Date;
    getSystemTimezoneAdjustmentMinute(date?: Date, overrideTimezoneOffset?: number): number;
}
export declare class ParsingComponents implements ParsedComponents {
    private knownValues;
    private impliedValues;
    private reference;
    constructor(reference: ReferenceWithTimezone, knownComponents?: {
        [c in Component]?: number;
    });
    get(component: Component): number | null;
    isCertain(component: Component): boolean;
    getCertainComponents(): Array<Component>;
    imply(component: Component, value: number): ParsingComponents;
    assign(component: Component, value: number): ParsingComponents;
    delete(component: Component): void;
    clone(): ParsingComponents;
    isOnlyDate(): boolean;
    isOnlyTime(): boolean;
    isOnlyWeekdayComponent(): boolean;
    isOnlyDayMonthComponent(): boolean;
    isValidDate(): boolean;
    toString(): string;
    dayjs(): dayjs.Dayjs;
    date(): Date;
    private dateWithoutTimezoneAdjustment;
    static createRelativeFromReference(reference: ReferenceWithTimezone, fragments: {
        [c in QUnitType]?: number;
    }): ParsingComponents;
}
export declare class ParsingResult implements ParsedResult {
    refDate: Date;
    index: number;
    text: string;
    reference: ReferenceWithTimezone;
    start: ParsingComponents;
    end?: ParsingComponents;
    constructor(reference: ReferenceWithTimezone, index: number, text: string, start?: ParsingComponents, end?: ParsingComponents);
    clone(): ParsingResult;
    date(): Date;
    toString(): string;
}