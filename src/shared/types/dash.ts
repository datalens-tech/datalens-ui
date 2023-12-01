import {Operations} from '../modules';

import {ClientChartsConfig, Dictionary, Entry, EntryScope, Params, StringParams} from './index';

export enum DashTabItemType {
    Title = 'title',
    Text = 'text',
    Widget = 'widget',
    Control = 'control',
}

export enum DashTabItemTitleSize {
    L = 'l',
    M = 'm',
    S = 's',
    XS = 'xs',
}

export enum DashTabItemControlSourceType {
    Dataset = 'dataset',
    Manual = 'manual',
    External = 'external',
}

export enum DashTabItemControlElementType {
    Select = 'select',
    Date = 'date',
    Input = 'input',
}

export enum DashTabConnectionKind {
    Ignore = 'ignore',
}

export enum DashLoadPriority {
    Charts = 'charts',
    Selectors = 'selectors',
}

export interface DashEntryCreateParams extends DashEntry, DashData {}

export interface DashEntry extends Entry {
    scope: EntryScope.Dash;
    type: '';
    data: DashData;
    savedId: string;
    revId: string;
    updatedAt: string;
    publishedId: string;
    asNew?: boolean;
    fake?: boolean;
}

export type DashSettings = {
    autoupdateInterval: null | number;
    maxConcurrentRequests: null | number;
    silentLoading: boolean;
    dependentSelectors: boolean;
    hideTabs: boolean;
    hideDashTitle?: boolean;
    expandTOC: boolean;
    globalParams?: DashSettingsGlobalParams;
    loadPriority?: DashLoadPriority;
    loadOnlyVisibleCharts?: boolean;
};

export interface DashData {
    counter: number;
    tabs: DashTab[];
    salt: string;
    schemeVersion: number;
    settings: DashSettings;
    description?: string;
    accessDescription?: string;
    supportDescription?: string;
}

export interface DashTab {
    id: string;
    title: string;
    items: DashTabItem[];
    layout: DashTabLayout[];
    aliases: DashTabAliases;
    connections: DashTabConnection[];
}

export type DashSettingsGlobalParams = Record<string, string | string[]>;
export type DashWidgetsConfigsMapper = Record<string, ClientChartsConfig>;

export type DashTabItem =
    | DashTabItemText
    | DashTabItemTitle
    | DashTabItemWidget
    | DashTabItemControl;

export interface DashTabItemBase {
    id: string;
    namespace: string;
    type: DashTabItemType;
    orderId?: number;
    defaultOrderId?: number;
    title?: string;
}

export interface DashTabItemText extends DashTabItemBase {
    type: DashTabItemType.Text;
    data: {
        text: string;
    };
}

export interface DashTabItemTitle extends DashTabItemBase {
    type: DashTabItemType.Title;
    data: {
        text: string;
        size: DashTabItemTitleSize;
        showInTOC: boolean;
    };
}

export interface DashTabItemWidget extends DashTabItemBase {
    type: DashTabItemType.Widget;
    data: {
        hideTitle: boolean;
        tabs: DashTabItemWidgetTab[];
    };
}

export interface DashTabItemWidgetTab {
    id: string;
    title: string;
    description: string;
    chartId: string;
    isDefault: boolean;
    params: StringParams;
    autoHeight?: boolean;
    enableActionParams?: boolean;
}

export interface DashTabItemControl extends DashTabItemBase {
    type: DashTabItemType.Control;
    data: DashTabItemControlData;
    defaults: Params;
}

export interface DashTabItemControlData {
    title: string;
    sourceType: DashTabItemControlSourceType;
    source:
        | DashTabItemControlDataset['source']
        | DashTabItemControlManual['source']
        | DashTabItemControlExternal['source'];
}

export interface DashTabItemControlDataset extends DashTabItemControlData {
    sourceType: DashTabItemControlSourceType.Dataset;
    source: {
        datasetId: string;
        datasetFieldId: string;
    } & DashTabItemControlElement;
}

export interface DashTabItemControlManual extends DashTabItemControlData {
    sourceType: DashTabItemControlSourceType.Manual;
    source: {
        fieldName: string;
        fieldType: string;
        acceptableValues:
            | {
                  // elementType: select
                  value: string;
                  title: string;
              }[]
            | {
                  // elementType: date
                  from: string;
                  to: string;
              };
    } & DashTabItemControlElement;
}

type DashTabItemControlElement =
    | DashTabItemControlElementSelect
    | DashTabItemControlElementInput
    | DashTabItemControlElementDate;

export interface DashTabItemControlElementBase {
    showTitle: boolean;
    elementType: DashTabItemControlElementType;
    operation?: Operations;
    showInnerTitle?: boolean;
    innerTitle?: boolean;
    fieldType?: string;
}

export interface DashTabItemControlElementSelect extends DashTabItemControlElementBase {
    elementType: DashTabItemControlElementType.Select;
    multiselectable: boolean;
    defaultValue: string | string[];
}

export interface DashTabItemControlElementInput extends DashTabItemControlElementBase {
    elementType: DashTabItemControlElementType.Input;
    defaultValue: string;
}

export interface DashTabItemControlElementDate extends DashTabItemControlElementBase {
    elementType: DashTabItemControlElementType.Date;
    isRange: boolean;
    defaultValue: string;
}

export interface DashTabItemControlExternal extends DashTabItemControlData {
    sourceType: DashTabItemControlSourceType.External;
    source: {
        chartId: string;
    };
}

export interface DashTabLayout {
    h: number;
    i: string;
    w: number;
    x: number;
    y: number;
}

export interface DashTabAliases extends Dictionary<Array<string[]>> {}

export interface DashTabConnection {
    from: string;
    to: string;
    kind: DashTabConnectionKind;
}

export interface DashStateData
    extends Dictionary<{
        params: Params;
        state: {
            // for chart state
            tabId: string;
        };
    }> {}

export interface DashStats {
    dashId: string;
    dashTabId: string;
    dashStateHash: string | null;
    login: string;
}
