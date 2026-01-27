export const LINE_WIDTH_MAX_VALUE = 12;
export const LINE_WIDTH_MIN_VALUE = 1;
export const LINE_WIDTH_VALUE_STEP = 1;
export const LINE_WIDTH_AUTO_VALUE = 'auto';
export const LINE_WIDTH_DEFAULT_VALUE = '2';

export const LINE_CAPS = {
    ROUND: 'round',
    SQUARE: 'square',
} as const;

export const LINE_JOINS = {
    ROUND: 'round',
    MITER: 'miter',
} as const;

export const DEFAULT_LINE_CAP = LINE_CAPS.SQUARE;
export const DFAULT_LINE_JOIN = LINE_JOINS.ROUND;
