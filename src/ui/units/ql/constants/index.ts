import {ConnectorType, QLChartType} from '../../../../shared';
import {VISUALIZATION_IDS} from '../../../constants/visualizations';

export enum AppStatus {
    Unconfigured = 'unconfigured',
    Loading = 'loading',
    Failed = 'failed',
    Ready = 'ready',
}

export enum VisualizationStatus {
    Empty = 'empty',
    LoadingChart = 'loadingChart',
    LoadingEverything = 'loadingEverything',
    Ready = 'ready',
}

export enum ConnectionStatus {
    Empty = 'empty',
    Failed = 'failed',
    Ready = 'ready',
}

export const PANE_VIEWS = {
    MAIN: 'Main',
    TABLE_PREVIEW: 'Table preview',
    PREVIEW: 'Preview',
    SETTINGS: 'Settings',
};

export const DEFAULT_TYPE = 'graph_ql_node';

export const DEFAULT_TAB_ID = 'js';

export const THEME = {
    LIGHT: 'light',
    DARK: 'dark',
};

export const ENTRY_ACTION = {
    SAVE_AS: 'saveAs',
};

export const DEFAULT_TIMEZONE = 'UTC';

export const DEFAULT_SALT = '0.5976424500695929';

export const AVAILABLE_CHART_TYPES: QLChartType[] = [
    QLChartType.Sql,
    QLChartType.Promql,
    QLChartType.Monitoringql,
];

// Connection types available for QL charts
export const AVAILABLE_SQL_CONNECTION_TYPES = [
    ConnectorType.ChFrozenDemo,
    ConnectorType.ChOverYt,
    ConnectorType.ChOverYtUserAuth,
    ConnectorType.Chydb,
    ConnectorType.Clickhouse,
    ConnectorType.Greenplum,
    ConnectorType.Mssql,
    ConnectorType.Mysql,
    ConnectorType.Oracle,
    ConnectorType.Postgres,
    ConnectorType.Trino,
    ConnectorType.Ydb,
    ConnectorType.Chyt,
    ConnectorType.ChytNb,
    ConnectorType.Yq,
];

export const AVAILABLE_PROMQL_CONNECTION_TYPES = ['promql'];

export const AVAILABLE_MONITORINGQL_CONNECTION_TYPES = ['solomon', 'monitoring'];

export const AVAILABLE_CONNECTION_TYPES_BY_CHART_TYPE = {
    [QLChartType.Sql]: AVAILABLE_SQL_CONNECTION_TYPES,
    [QLChartType.Promql]: AVAILABLE_PROMQL_CONNECTION_TYPES,
    [QLChartType.Monitoringql]: AVAILABLE_MONITORINGQL_CONNECTION_TYPES,
};

export const QL_MOCKED_DATASET_ID = 'ql-mocked-dataset';

export const DEFAULT_VISUALIZATION_ID_QL = VISUALIZATION_IDS.COLUMN;

export const QL_EDIT_HISTORY_UNIT_ID = 'ql';
