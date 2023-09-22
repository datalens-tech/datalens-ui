export type FormatOptions = {
    // with 'auto', if there is a decimal part, then there will be 2 decimal places,
    // and if the number is less than 1, then there will be 4 characters
    precision?: number | 'auto';
    unitRate?: number;
    showRankDelimiter?: boolean;
    lang?: string;
    labelMode?: string;
};

export type FormatNumberOptions = FormatOptions & {
    format?: 'number' | 'percent';
    multiplier?: number;
    prefix?: string;
    postfix?: string;
    unit?: 'auto' | 'k' | 'm' | 'b' | 't' | null;
};
