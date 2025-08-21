import type {ConfigNode} from 'libs/DatalensChartkit/modules/data-provider/charts/types';
import type {AnyAction} from 'redux';
import type {ThunkDispatch} from 'redux-thunk';
import type {
    CommonSharedExtraSettings,
    EntryAnnotation,
    QLChartType,
    QlConfigPreviewTableData,
    Shared,
} from 'shared';
import type {GetEntryResponse} from 'shared/schema';
import type {
    QLConfigQuery,
    QlConfig,
    QlConfigParam,
    QlConfigResultEntryMetadataDataColumnOrGroup,
} from 'shared/types/config/ql';
import type {DatalensGlobalState} from 'ui/index';
import type {CloseDialogAction, OpenDialogAction} from 'ui/store/actions/dialog';
import type {RESET_WIZARD_STORE, SetWizardStoreAction} from 'ui/units/wizard/actions';
import type {DatasetAction} from 'units/wizard/actions/dataset';
import type {VisualizationAction} from 'units/wizard/actions/visualization';

import type {AppStatus, ConnectionStatus, VisualizationStatus} from '../../constants';
import type {
    ADD_PARAM,
    ADD_PARAM_IN_QUERY,
    ADD_QUERY,
    DRAW_PREVIEW,
    DUPLICATE_QUERY,
    REMOVE_PARAM,
    REMOVE_PARAM_IN_QUERY,
    REMOVE_QUERY,
    RESET_QL_STORE,
    SET_CHART_TYPE,
    SET_COLUMNS_ORDER,
    SET_CONNECTION,
    SET_CONNECTION_SOURCES,
    SET_CONNECTION_SOURCE_SCHEMA,
    SET_CONNECTION_STATUS,
    SET_DEFAULT_PATH,
    SET_DESCRIPTION,
    SET_ENTRY,
    SET_ENTRY_KEY,
    SET_ERROR,
    SET_EXTRA_SETTINGS,
    SET_QL_STORE,
    SET_QUERY_METADATA,
    SET_QUERY_VALUE,
    SET_SETTINGS,
    SET_STATUS,
    SET_TABLE_PREVIEW_DATA,
    SET_VISUALIZATION_STATUS,
    TOGGLE_TABLE_PREVIEW,
    UPDATE_PARAM,
    UPDATE_PARAM_IN_QUERY,
    UPDATE_QUERY,
} from '../actions/ql';

// QLEntry - chart created in QL
export interface QLEntry extends GetEntryResponse {
    fake?: boolean;
    fakeName?: string;
    data: QLEntryData;
}

// QLEntryData - chart data created in QL
export interface QLEntryData {
    [index: string]: QlConfig;
}

// QLConnectionEntry - the connection used in the QL chart
export interface QLConnectionEntry extends GetEntryResponse {
    name: string;
}

export interface QLState {
    chartType: QLChartType | null;
    appStatus: AppStatus;
    defaultPath: string;
    visualizationStatus: VisualizationStatus;
    connectionStatus: ConnectionStatus;
    extraSettings: CommonSharedExtraSettings;
    tablePreviewVisible: boolean;
    error: Error | null;
    settings: QLSettings;
    visualization: Shared['visualization'] | null;
    entry: QLEntry | null;
    metadata: {
        order: QlConfigResultEntryMetadataDataColumnOrGroup[] | null;
    };
    tablePreviewData: QlConfigPreviewTableData;
    params: QlConfigParam[];
    order: QlConfigResultEntryMetadataDataColumnOrGroup[] | null;
    connection: QLConnectionEntry | null;
    connectionSources: {
        title: string;
        group: string[];
        source_type: string;
    }[];
    connectionSourcesSchemas: Record<string, Record<string, string>[]>;
    chart: QLChart | null;
    grid: QLGrid;
    panes: QLPanes;
    tabs: QLTabs;
    queryValue: string;
    queries: QLConfigQuery[];
    paneViews: QLPaneViews;
    redirectUrl?: string;
    annotation: EntryAnnotation | null;
}

export interface QLActionResetQLStore {
    type: typeof RESET_QL_STORE;
}

export interface QLActionSetQLStore {
    type: typeof SET_QL_STORE;
    store: QLState;
}

export interface QLActionSetStatus {
    type: typeof SET_STATUS;
    appStatus: AppStatus;
}

export interface QLActionSetError {
    type: typeof SET_ERROR;
    error: Error;
}

export interface QLActionSetSettings {
    type: typeof SET_SETTINGS;
    chartType: QLChartType | null;
    tabs: QLTabs;
    queryValue: string;
    queries: QLConfigQuery[];
    settings: QLSettings;
    panes: QLPanes;
    grid: QLGrid;
    chart: QLChart | null;
    params: QlConfigParam[];
    redirectUrl?: string;
}

export interface QLActionSetDefaultPath {
    type: typeof SET_DEFAULT_PATH;
    newDefaultPath: string;
}

export interface QLActionSetEntry {
    type: typeof SET_ENTRY;
    entry: QLEntry | null;
}

export interface QLActionSetEntryKey {
    type: typeof SET_ENTRY_KEY;
    payload: string;
}

export interface QLActionSetExtraSettings {
    type: typeof SET_EXTRA_SETTINGS;
    extraSettings: CommonSharedExtraSettings;
}

export interface QLActionAddQuery {
    type: typeof ADD_QUERY;
}

export interface QLActionDuplcateQuery {
    type: typeof DUPLICATE_QUERY;
    index: number;
}

export interface QLActionUpdateQuery {
    type: typeof UPDATE_QUERY;
    query: QLConfigQuery;
    index: number;
}

export interface QLActionRemoveQuery {
    type: typeof REMOVE_QUERY;
    index: number;
}

export interface QLActionUpdateParam {
    type: typeof UPDATE_PARAM;
    param: QlConfigParam;
    index: number;
}

export interface QLActionRemoveParam {
    type: typeof REMOVE_PARAM;
    index: number;
}

export interface QLActionAddParam {
    type: typeof ADD_PARAM;
}

export interface QLActionAddParamInQuery {
    type: typeof ADD_PARAM_IN_QUERY;
    queryIndex: number;
}

export interface QLActionUpdateParamInQuery {
    type: typeof UPDATE_PARAM_IN_QUERY;
    param: QlConfigParam;
    queryIndex: number;
    paramIndex: number;
}

export interface QLActionRemoveParamInQuery {
    type: typeof REMOVE_PARAM_IN_QUERY;
    queryIndex: number;
    paramIndex: number;
}

export interface QLActionSetQueryMetadata {
    type: typeof SET_QUERY_METADATA;
    metadata: {
        order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    };
}

export interface QLActionSetTablePreviewData {
    type: typeof SET_TABLE_PREVIEW_DATA;
    tablePreviewData: QlConfigPreviewTableData;
}

export interface QLActionSetVisualizationStatus {
    type: typeof SET_VISUALIZATION_STATUS;
    visualizationStatus: VisualizationStatus;
}

export interface QLActionSetColumnsOrder {
    type: typeof SET_COLUMNS_ORDER;
    order: QlConfigResultEntryMetadataDataColumnOrGroup[];
}

export interface QLActionSetConnectionSources {
    type: typeof SET_CONNECTION_SOURCES;
    connectionSources: Record<string, string>[];
    connectionFreeformSources: Record<string, string>[];
}

export interface QLActionSetConnectionSourceSchema {
    type: typeof SET_CONNECTION_SOURCE_SCHEMA;
    tableName: string;
    schema: Record<string, any>[];
}

export interface QLActionSetChartType {
    type: typeof SET_CHART_TYPE;
    chartType: QLChartType | null;
}

export interface QLActionSetConnection {
    type: typeof SET_CONNECTION;
    connection: QLConnectionEntry;
}

export interface QLActionSetConnectionStatus {
    type: typeof SET_CONNECTION_STATUS;
    connectionStatus: ConnectionStatus;
}

export interface QLActionSetQueryValue {
    type: typeof SET_QUERY_VALUE;
    newValue: string;
}

export interface QLActionDrawPreview {
    type: typeof DRAW_PREVIEW;
    withoutTable?: boolean;
    previewData: any;
}

export interface QLActionToggleTablePreview {
    type: typeof TOGGLE_TABLE_PREVIEW;
}

export interface ResetWizardStoreAction {
    type: typeof RESET_WIZARD_STORE;
}

export interface ResetWizardStoreAction {
    type: typeof RESET_WIZARD_STORE;
}

interface SetQLDescriptionAction {
    type: typeof SET_DESCRIPTION;
    payload: string;
}

export type QLAction =
    | QLActionResetQLStore
    | QLActionSetQLStore
    | QLActionAddQuery
    | QLActionUpdateQuery
    | QLActionSetChartType
    | QLActionSetExtraSettings
    | QLActionSetConnectionSources
    | QLActionSetConnectionSourceSchema
    | QLActionSetDefaultPath
    | QLActionSetStatus
    | QLActionSetError
    | QLActionSetSettings
    | QLActionSetEntry
    | QLActionSetQueryMetadata
    | QLActionSetColumnsOrder
    | QLActionSetConnection
    | QLActionSetConnectionStatus
    | QLActionSetQueryValue
    | QLActionDrawPreview
    | VisualizationAction
    | DatasetAction
    | ResetWizardStoreAction
    | SetWizardStoreAction
    | QLActionSetEntryKey
    | QLActionSetVisualizationStatus
    | QLActionSetTablePreviewData
    | QLActionRemoveParamInQuery
    | QLActionUpdateParamInQuery
    | QLActionAddParamInQuery
    | QLActionRemoveParam
    | QLActionUpdateParam
    | QLActionAddParam
    | QLActionRemoveQuery
    | QLActionDuplcateQuery
    | QLActionToggleTablePreview
    | CloseDialogAction
    | OpenDialogAction
    | SetQLDescriptionAction;

export type QLDispatch = ThunkDispatch<DatalensGlobalState, void, AnyAction>;

export type QLChartConfig = ConfigNode & {
    data: {
        shared: {
            // I think it's fair so far
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key: string]: any;
        };
    };
};

export interface QLChart {
    updateKey: number;
    id: string;
    withoutTable?: boolean;
    preview: QLChartConfig;
}

export interface QLTabData {
    name: string;
    id: string;
    language: string;
}

export interface QLTabs {
    byId: QLTabsById;
    allIds: string[];
}

export interface QLSettings {
    counter: number;
    salt: string;
}

export interface QLPaneData {
    currentTab: string | null;
    id: string;
    view: string;
}

export interface QLPanes {
    byId: {
        [id: string]: QLPaneData;
    };
    allIds: string[];
}

export interface QLPaneViews {
    byId: QLPaneViewsById;
    allIds: string[];
}

export interface QLPaneViewsById {
    [name: string]: QLPaneView;
}

export interface QLPaneView {
    id: string;
    name: string;
}

export interface QLGridScheme {
    name: string;
    childNodes?: QLGridScheme[];
    props?: {
        split?: 'vertical' | 'horizontal' | undefined;
        minSize?: string | number;
        maxSize?: string | number;
        defaultSize?: string | number;
        loader?: boolean;
        pane1Style?: object;
        resizerStyle?: object;
        pane2Style?: object;
    };
    index?: number;
}

export interface QLGridSchemeData {
    panes: string[];
    scheme: QLGridScheme[];
}

export interface QLGridSchemes {
    ids: string[];
    default: string;
    schemes: {[key: string]: QLGridSchemeData};
}

export interface QLGrid {
    panes: string[];
    scheme: string;
}

export interface QLTabsById {
    [id: string]: QLTabData;
}
