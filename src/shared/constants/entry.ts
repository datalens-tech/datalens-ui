import {WizardType} from '../types';

import {ConnectorType} from './connections';

export const NAVIGATION_ROUTE = 'navigation';
export const DASHBOARDS_ROUTE = 'dashboards';
export const DC_DASHBOARDS_ROUTE = 'dash';
export const WIZARD_ROUTE = 'wizard';
export const SQL_ROUTE = 'sql';
export const QL_ROUTE = 'ql';
export const PREVIEW_ROUTE = 'preview';
export const EDITOR_ROUTE = 'editor';
export const DATASETS_ROUTE = 'datasets';
export const CONNECTIONS_ROUTE = 'connections';

export const ENTRY_ROUTES = [
    NAVIGATION_ROUTE,
    DASHBOARDS_ROUTE,
    DC_DASHBOARDS_ROUTE,
    WIZARD_ROUTE,
    SQL_ROUTE,
    QL_ROUTE,
    PREVIEW_ROUTE,
    EDITOR_ROUTE,
    DATASETS_ROUTE,
    CONNECTIONS_ROUTE,
];

export const ENTRY_ID_LENGTH = 13;
export const ENTRY_SLUG_SEPARATOR = '-';
export const MAX_SLUG_LENGTH = 54;

export const LEGACY_WIZARD_TYPE = {
    GRAPH_WIZARD: 'graph_wizard',
    METRIC_WIZARD: 'metric_wizard',
};
export const WIZARD_TYPES: string[] = Object.values(WizardType);

export const QL_TYPE = {
    GRAPH_QL_NODE: 'graph_ql_node',
    D3_QL_NODE: 'd3_ql_node',
    TIMESERIES_QL_NODE: 'timeseries_ql_node',
    TABLE_QL_NODE: 'table_ql_node',
    YMAP_QL_NODE: 'ymap_ql_node',
    METRIC_QL_NODE: 'metric2_ql_node',
    MARKUP_QL_NODE: 'markup_ql_node',
    LEGACY_GRAPH_QL_NODE: 'graph_sql_node',
    LEGACY_TABLE_QL_NODE: 'table_sql_node',
    LEGACY_YMAP_QL_NODE: 'ymap_sql_node',
    LEGACY_METRIC_QL_NODE: 'metric2_sql_node',
};
export const LEGACY_EDITOR_TYPE = {
    GRAPH: 'graph',
    TABLE: 'table',
    MAP: 'map',
    MANAGER: 'manager',
    TEXT: 'text',
    METRIC: 'metric',
};
export const EDITOR_TYPE = {
    MODULE: 'module',
    GRAPH_NODE: 'graph_node',
    TABLE_NODE: 'table_node',
    TEXT_NODE: 'text_node',
    METRIC_NODE: 'metric_node',
    MAP_NODE: 'map_node',
    YMAP_NODE: 'ymap_node',
    CONTROL_NODE: 'control_node',
    MARKDOWN_NODE: 'markdown_node',
    MARKUP_NODE: 'markup_node',
    TIMESERIES_NODE: 'timeseries_node',
    D3_NODE: 'd3_node',
    BLANK_CHART_NODE: 'blank-chart_node',
};

export type EditorTypes = (typeof EDITOR_TYPE)[keyof typeof EDITOR_TYPE];

export const ENTRY_TYPES = {
    legacyEditor: Object.values(LEGACY_EDITOR_TYPE),
    editor: Object.values(EDITOR_TYPE),
    wizard: WIZARD_TYPES,
    ql: Object.values(QL_TYPE),
    connection: Object.values(ConnectorType),
};
