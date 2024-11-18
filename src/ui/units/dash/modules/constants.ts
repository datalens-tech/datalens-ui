import {ShareOptions} from '@gravity-ui/components';

import {ITEM_TYPE} from '../../../constants/dialogs';

export enum DashErrorCode {
    NOT_FOUND = 'ERR.DASH.NOT_FOUND_ERROR',
    // TODO: Remove after cleaning usage
    SECRET_ACCESS_DENIED = 'ERR.DASH.SECRET_ACCESS_DENIED',
}

export const LOCK_DURATION = 5 * 60 * 1000;
export const LOCK_EXTEND_TIMEOUT = 4 * 60 * 1000;
export const EMPTY_VALUE = '—';

export const STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAIL: 'fail',
    DONE: 'done',
};

export enum EntryTypeNode {
    CONTROL_NODE = 'control_node',
}

export const CONNECTION_KIND = {
    IGNORE: 'ignore',
};

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
    BLANK_CHART: 'blank-chart',
    MARKUP: 'markup',
} as const;

// chart types that can be filtered by selectors
export const DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES = {
    graph: DASH_WIDGET_TYPES.GRAPH,
    table: DASH_WIDGET_TYPES.TABLE,
    timeseries: DASH_WIDGET_TYPES.TIMESERIES,
    map: DASH_WIDGET_TYPES.MAP,
    metric: DASH_WIDGET_TYPES.METRIC,
    metric2: DASH_WIDGET_TYPES.METRIC2,
    ymap: DASH_WIDGET_TYPES.YMAP,
    markdown: DASH_WIDGET_TYPES.MARKDOWN,
    markup: DASH_WIDGET_TYPES.MARKUP,
    d3: DASH_WIDGET_TYPES.D3,
};

export type AcceptFiltersWidgetType =
    (typeof DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES)[keyof typeof DASH_ACCEPT_FILTERING_CHARTS_WIDGET_TYPES];

export type WidgetType = (typeof DASH_WIDGET_TYPES)[keyof typeof DASH_WIDGET_TYPES];

// chart types that can filter other charts
export const DASH_FILTERING_CHARTS_WIDGET_TYPES = {
    graph: 'graph',
    table: 'table',
    ymap: 'ymap',
    //timeseries: 'timeseries', // will be supported later
};

export type FilteringWidgetType =
    (typeof DASH_FILTERING_CHARTS_WIDGET_TYPES)[keyof typeof DASH_FILTERING_CHARTS_WIDGET_TYPES];

export enum Mode {
    Loading = 'loading',
    Updating = 'updating',
    View = 'view',
    Edit = 'edit',
    Error = 'error',
    SelectState = 'selectState',
}

export const socialNets = [ShareOptions.Telegram, ShareOptions.Twitter, ShareOptions.VK];

export const CROSS_PASTE_ITEMS_ALLOWED = [ITEM_TYPE.TITLE, ITEM_TYPE.TEXT];
