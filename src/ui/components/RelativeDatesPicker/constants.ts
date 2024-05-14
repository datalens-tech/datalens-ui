export const TOOLTIP_DELAY_CLOSING = 250;

export const INTERVAL_PREFIX = '__interval_';

export const SCALE_DAY = 'd';

export const CONTROLS = {
    START: 'start',
    END: 'end',
} as const;

export const DATE_TYPES = {
    ABSOLUTE: 'absolute',
    RELATIVE: 'relative',
} as const;

export const RANGE_PARTS = {
    START: 'start',
    END: 'end',
} as const;

export const POSTFIXES = {
    START: 'Start',
    END: 'End',
};

export const LUXON_FORMATS = {
    DATE: 'dd.MM.yyyy',
    DATE_TIME: 'dd.MM.yyyy HH:mm:ss',
};

export const SIGNS = {
    PLUS: '+',
    MINUS: '-',
};

export const PRESETS = [
    {start: '-0', end: '-0'},
    {start: '-1', end: '-1'},
    {start: '-2', end: '-0'},
    {start: '-6', end: '-0'},
    {start: '-13', end: '-0'},
    {start: '-27', end: '-0'},
    {start: '-89', end: '-0'},
    {start: '-179', end: '-0'},
    {start: '-364', end: '-0'},
];
