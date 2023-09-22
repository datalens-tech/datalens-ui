export enum NumberFormatType {
    Number = 'number',
    Percent = 'percent',
}

export enum NumberFormatUnit {
    Auto = 'auto',
    K = 'k',
    M = 'm',
    B = 'b',
    T = 't',
}

export interface CommonNumberFormattingOptions {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    // for a situation where unit is specified, integers is set to 0
    precision?: number;
    labelMode?: string;
}

export type IntegerNumberFormattingOptions = CommonNumberFormattingOptions;

export type FloatNumberFormattingOptions = CommonNumberFormattingOptions;
