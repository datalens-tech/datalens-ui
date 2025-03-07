export enum DashMailingChartHeight {
    Original = 'original',
    '280px' = '280',
    '320px' = '320',
    '480px' = '480',
    '640px' = '640',
    '720px' = '720',
}

export enum DashMailingChartWidth {
    Full = 'full',
    '600px' = '600',
}

export enum Weekday {
    Mon = 'mon',
    Tue = 'tue',
    Wed = 'wed',
    Thu = 'thu',
    Fri = 'fri',
    Sat = 'sat',
    Sun = 'sun',
}

export const DASH_GRID_LAYOUT = {
    ROW_HEIGHT: 18,
    MARGIN: 8,
    COLS: 36,
};

export const FOCUSED_WIDGET_PARAM_NAME = 'focus';

export const RESTRICTED_PARAM_NAMES = [
    'tab',
    'state',
    'mode',
    FOCUSED_WIDGET_PARAM_NAME,
    'grid',
    'scale',
    'tz',
    'timezone',
    'date',
    'datetime',
    'genericdatetime',
];

export const DASH_CURRENT_SCHEME_VERSION = 8;

export const LOADED_DASH_CLASS = 'dash-body-loaded';
