import type {ConfigNode} from 'libs/DatalensChartkit/modules/data-provider/charts/types';
import type {
    CommonSharedExtraSettings,
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
import type {DatasetAction} from 'units/wizard/actions/dataset';
import type {VisualizationAction} from 'units/wizard/actions/visualization';

import type {AppStatus, ConnectionStatus, VisualizationStatus} from '../../constants';

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
}

export interface QLActionResetQLStore {
    type: symbol;
}

export interface QLActionSetStatus {
    type: symbol;
    appStatus: AppStatus;
}

export interface QLActionSetError {
    type: symbol;
    error: Error;
}

export interface QLActionSetSettings {
    type: symbol;
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
    type: symbol;
    newDefaultPath: string;
}

export interface QLActionSetEntry {
    type: symbol;
    entry: QLEntry | null;
}

export interface QLActionSetEntryKey {
    type: symbol;
    payload: string;
}

export interface QLActionSetExtraSettings {
    type: symbol;
    extraSettings: CommonSharedExtraSettings;
}

export interface QLActionUpdateQuery {
    type: symbol;
    query: QLConfigQuery;
    index: number;
}

export interface QLActionRemoveQuery {
    type: symbol;
    index: number;
}

export interface QLActionUpdateParam {
    type: symbol;
    param: QlConfigParam;
    index: number;
}

export interface QLActionRemoveParam {
    type: symbol;
    index: number;
}

export interface QLActionAddParamInQuery {
    type: symbol;
    queryIndex: number;
}

export interface QLActionUpdateParamInQuery {
    type: symbol;
    param: QlConfigParam;
    queryIndex: number;
    paramIndex: number;
}

export interface QLActionRemoveParamInQuery {
    type: symbol;
    queryIndex: number;
    paramIndex: number;
}

export interface QLActionSetQueryMetadata {
    type: symbol;
    metadata: {
        order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    };
}

export interface QLActionSetTablePreviewData {
    type: symbol;
    tablePreviewData: QlConfigPreviewTableData;
}

export interface QLActionSetVisualizationStatus {
    type: symbol;
    visualizationStatus: VisualizationStatus;
}

export interface QLActionSetColumnsOrder {
    type: symbol;
    order: QlConfigResultEntryMetadataDataColumnOrGroup[];
}

export interface QLActionSetConnectionSources {
    type: symbol;
    connectionSources: Record<string, string>[];
    connectionFreeformSources: Record<string, string>[];
}

export interface QLActionSetConnectionSourceSchema {
    type: symbol;
    tableName: string;
    schema: Record<string, any>[];
}

export interface QLActionSetChartType {
    type: symbol;
    chartType: QLChartType | null;
}

export interface QLActionSetConnection {
    type: symbol;
    connection: QLConnectionEntry;
}

export interface QLActionSetConnectionStatus {
    type: symbol;
    connectionStatus: ConnectionStatus;
}

export interface QLActionSetQueryValue {
    type: symbol;
    newValue: string;
}

export interface QLActionDrawPreview {
    type: symbol;
    withoutTable?: boolean;
    previewData: any;
}

export interface ResetWizardStoreAction {
    type: string;
}

export type QLAction =
    | QLActionResetQLStore
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
    | QLActionSetQueryValue
    | QLActionDrawPreview
    | VisualizationAction
    | DatasetAction
    | ResetWizardStoreAction
    | QLActionSetEntryKey;

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
