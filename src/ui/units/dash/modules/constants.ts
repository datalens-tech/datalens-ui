export const LOCK_DURATION = 5 * 60 * 1000;
export const LOCK_EXTEND_TIMEOUT = 4 * 60 * 1000;
export const EMPTY_VALUE = '—';

export const STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAIL: 'fail',
    DONE: 'done',
};

export const ENTRY_SCOPE = {
    WIDGET: 'widget',
    DATASET: 'dataset',
};

export const ENTRY_TYPE = {
    CONTROL_NODE: 'control_node',
};

export const CONNECTION_KIND = {
    IGNORE: 'ignore',
};

// chart types that can be filtered by selectors
export const DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES = {
    graph: 'graph',
    table: 'table',
    timeseries: 'timeseries',
    map: 'map',
    metric: 'metric',
    metric2: 'metric2',
    ymap: 'ymap',
    markdown: 'markdown',
    d3: 'd3',
};

export type AcceptFiltersWidgetType =
    typeof DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES[keyof typeof DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES];

// all dash widget detailed types
export const DASH_WIDGET_TYPES = {
    GRAPH: 'graph',
    TABLE: 'table',
    MAP: 'map',
    TEXT: 'text',
    METRIC: 'metric',
    METRIC2: 'metric2',
    YMAP: 'ymap',
    CONTROL: 'control',
    MARKDOWN: 'markdown',
    TIMESERIES: 'timeseries',
    D3: 'd3',
} as const;

export type WidgetType = typeof DASH_WIDGET_TYPES[keyof typeof DASH_WIDGET_TYPES];

// chart types that can filter other charts
export const DASH_FILTERING_CHARTS_WIDGET_TYPES = {
    graph: 'graph',
    table: 'table',
    //timeseries: 'timeseries', // will be supported later
};

export type FilteringWidgetType =
    typeof DASH_FILTERING_CHARTS_WIDGET_TYPES[keyof typeof DASH_FILTERING_CHARTS_WIDGET_TYPES];

export enum Mode {
    Loading = 'loading',
    Updating = 'updating',
    View = 'view',
    Edit = 'edit',
    Error = 'error',
    SelectState = 'selectState',
}

export const CONTROL_WIDTH_PROPERTY = '--control-custom-width';
