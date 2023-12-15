import {QLChartType} from '../../../../shared';
import {VISUALIZATION_IDS} from '../../../constants/visualizations';

export enum AppStatus {
    Loading = 'loading',
    Failed = 'failed',
    Unconfigured = 'unconfigured',
    Ready = 'ready',
}

export enum VisualizationStatus {
    Empty = 'empty',
    LoadingChart = 'loadingChart',
    LoadingEverything = 'loadingEverything',
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

export const QL_MOCKED_DATASET_ID = 'ql-mocked-dataset';

export const DEFAULT_VISUALIZATION_ID_QL = VISUALIZATION_IDS.COLUMN;
