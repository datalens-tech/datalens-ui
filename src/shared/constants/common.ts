import {ACTION_PARAM_PREFIX} from '@gravity-ui/dashkit/helpers';

import {ControlType} from '../types/dash';

export enum AppInstallation {
    Opensource = 'opensource',
}

export enum AppEnvironment {
    Production = 'production',
    Preprod = 'preprod',
    Development = 'development',
    Staging = 'staging',
    Prod = 'prod',
}

export enum AppMode {
    Full = 'full',
    Datalens = 'datalens',
    Charts = 'charts',
}

export enum Language {
    Ru = 'ru',
    En = 'en',
}

export enum DeviceType {
    Phone = 'phone',
    Tablet = 'tablet',
    Desktop = 'desktop',
}

export const DEFAULT_PAGE_SIZE = 1000;

export const ENABLE = 'enable';
export const DISABLE = 'disable';

export const FALLBACK_LANGUAGES = [Language.En];

export const USER_SETTINGS_KEY = 'userSettings';

export const URL_ACTION_PARAMS_PREFIX = ACTION_PARAM_PREFIX;

export const DEFAULT_CHART_LINES_LIMIT = 100;

export const DEFAULT_DATE_FORMAT = 'DD.MM.YYYY';

export const DEFAULT_TIME_FORMAT = '24';

export const TIME_FORMAT_12 = 'h:mm a';

export const TIME_FORMAT_24 = 'HH:mm';

export const UPDATE_STATE_DEBOUNCE_TIME = 1000;

export const SCROLL_TITLE_DEBOUNCE_TIME = 400;

export const SHARED_URL_OPTIONS = {
    SAFE_CHART: '_safe_chart',
    WITHOUT_UI_SANDBOX_LIMIT: '_without_sandbox_time_limit',
};

export const WIZARD_CHART_NODE = {
    graph_wizard_node: 'statface_graph',
    table_wizard_node: 'table',
    metric_wizard_node: 'statface_metric',
    markup_wizard_node: 'config',
    d3_wizard_node: 'config',
};

export const QL_CHART_NODE = {
    graph_sql_node: 'statface_graph',
    graph_ql_node: 'statface_graph',
    timeseries_ql_node: 'statface_graph',
    table_sql_node: 'table',
    table_ql_node: 'table',
    markup_ql_node: 'config',
    metric2_ql_node: 'statface_graph',
};

export const EDITOR_CHART_NODE = {
    graph_node: 'statface_graph',
    graph_billing_node: 'statface_graph',
    table_node: 'table',
    text_node: 'statface_text',
    metric_node: 'statface_metric',
    metric_sql_node: 'statface_metric',
    metric_ql_node: 'statface_metric',
    map_node: 'statface_map',
    markup_node: 'config',
    markdown_node: '',
};

export const EDITOR_TYPE_CONFIG_TABS = {
    ...WIZARD_CHART_NODE,
    ...QL_CHART_NODE,
    ...EDITOR_CHART_NODE,
    module: '',
    control_dash: ControlType.Dash,
};
