import {SHARED_URL_OPTIONS} from 'shared';

export const URL_OPTIONS = {
    HIDE_COMMENTS: '_graph_hide_comments',
    HIDE_HOLIDAYS: '_graph_hide_holidays',
    NORMALIZE_SUB: '_normalize_sub',
    NORMALIZE_DIV: '_normalize_div',
    WITHOUT_LINE_LIMIT: '_graph_without_line_limit',
    WITHOUT_UI_SANDBOX_LIMIT: SHARED_URL_OPTIONS.WITHOUT_UI_SANDBOX_LIMIT,
    SAFE_CHART: SHARED_URL_OPTIONS.SAFE_CHART,
};

export const CONTROL_TYPE = {
    SELECT: 'select',
    BUTTON: 'button',
    INPUT: 'input',
    TEXTAREA: 'textarea',
    CHECKBOX: 'checkbox',
    DATEPICKER: 'datepicker',
    LINE_BREAK: 'line-break',
    RANGE_DATEPICKER: 'range-datepicker',
};

export const LINE_BREAKS_OPTIONS = {
    WRAP: 'wrap',
    NOWRAP: 'nowrap',
};

export const EXPORT_FORMATS = {
    XLSX: 'xlsx',
    CSV: 'csv',
    MARKDOWN: 'markdown',
    WIKI: 'wiki',
    SCREENSHOT: 'screenshort',
};

export type ExportFormatsType = (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS];

export const CLICK_ACTION_TYPE = {
    SET_PARAMS: 'setParams',
    SET_INITIAL_PARAMS: 'setInitialParams',
    RUN_ACTION: 'runAction',
};

export const REQUEST_ID_HEADER = 'x-request-id';
export const TRACE_ID_HEADER = 'x-trace-id';
export const SERVER_TRACE_ID_HEADER = 'x-server-trace-id';
