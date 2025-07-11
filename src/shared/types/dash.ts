import type {ItemDropProps} from '@gravity-ui/dashkit';

import type {Operations} from '../modules';

import type {
    ClientChartsConfig,
    Dictionary,
    Entry,
    EntryScope,
    HintSettings,
    StringParams,
    ValueOf,
} from './index';

export enum ControlType {
    Dash = 'control_dash',
}

export type DashChartRequestContext = Record<string, string>;

export enum DashTabItemType {
    Title = 'title',
    Text = 'text',
    Widget = 'widget',
    Control = 'control',
    GroupControl = 'group_control',
    Image = 'image',
}

export const DashTabItemTitleSizes = {
    XL: 'xl',
    L: 'l',
    M: 'm',
    S: 's',
    XS: 'xs',
} as const;

export type DashTabItemTitleSize = ValueOf<typeof DashTabItemTitleSizes>;

export enum DashTabItemControlSourceType {
    Dataset = 'dataset',
    Connection = 'connection',
    Manual = 'manual',
    External = 'external',
}

export enum DashTabItemControlElementType {
    Select = 'select',
    Date = 'date',
    Input = 'input',
    Checkbox = 'checkbox',
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
    // TODO: remove after code update
    // used only for secure cases
    signedGlobalParams?: DashSettingsGlobalParams;
    loadPriority?: DashLoadPriority;
    loadOnlyVisibleCharts?: boolean;
    margins?: [number, number];
    enableAssistant?: boolean;
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

export type DashDragOptions = ItemDropProps;

// config with strict requirements of settings for new dash
// schemeVersion comes from server
export type FakeDashData = Omit<DashData, 'schemeVersion'> & {
    settings: Required<Omit<DashSettings, 'margins' | 'enableAssistant' | 'signedGlobalParams'>> & {
        margins?: DashSettings['margins'];
        enableAssistant?: boolean;
    };
};

export interface DashTabSettings {
    fixedHeaderCollapsedDefault: boolean;
}
export interface DashTab {
    id: string;
    title: string;
    items: DashTabItem[];
    layout: DashTabLayout[];
    aliases: DashTabAliases;
    connections: DashTabConnection[];
    settings?: DashTabSettings;
}

export type DashSettingsGlobalParams = Record<string, string | string[]>;
export type DashWidgetsConfigsMapper = Record<string, ClientChartsConfig>;

export type DashTabItem =
    | DashTabItemText
    | DashTabItemTitle
    | DashTabItemWidget
    | DashTabItemControl
    | DashTabItemGroupControl
    | DashTabItemImage;

export type BackgroundSettings = {
    enabled?: boolean;
    color: string;
};

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
        autoHeight?: boolean;
        background?: BackgroundSettings;
    };
}

export type DashTitleSize =
    | DashTabItemTitleSize
    | {
          fontSize: number;
          lineHeight?: number;
      };

export interface DashTabItemTitle extends DashTabItemBase {
    type: DashTabItemType.Title;
    data: {
        text: string;
        size: DashTitleSize;
        showInTOC: boolean;
        autoHeight?: boolean;
        background?: BackgroundSettings;
        hint?: HintSettings;
    };
}

export interface DashTabItemWidget extends DashTabItemBase {
    type: DashTabItemType.Widget;
    data: {hideTitle: boolean; tabs: DashTabItemWidgetTab[]};
}

export interface DashTabItemWidgetTab {
    id: string;
    title: string;
    description: string;
    hint?: string;
    enableHint?: boolean;
    enableDescription?: boolean;
    chartId: string;
    isDefault: boolean;
    params: StringParams;
    autoHeight?: boolean;
    enableActionParams?: boolean;
    background?: BackgroundSettings;
}

export interface DashTabItemControl extends DashTabItemBase {
    type: DashTabItemType.Control;
    data: DashTabItemControlData;
    defaults: StringParams;
}

type DashTabItemControlCommonData = {
    id: string;
    title: string;
    placementMode?: 'auto' | '%' | 'px';
    autoHeight?: boolean;
    width?: string;
    defaults?: StringParams;
    namespace: string;
};

export type DashTabItemControlData =
    | DashTabItemControlDataset
    | DashTabItemControlManual
    | DashTabItemControlExternal
    | DashTabItemControlConnection;
export type DashTabItemControlSingle = DashTabItemControlDataset | DashTabItemControlManual;

type DashTabItemControlDatasetSource = {
    sourceType: DashTabItemControlSourceType.Dataset;
    source: {
        datasetId: string;
        datasetFieldId: string;
    } & DashTabItemControlElement;
};
export type DashTabItemControlDataset = DashTabItemControlCommonData &
    DashTabItemControlDatasetSource;

type DashTabItemControlConnectionSource = {
    sourceType: DashTabItemControlSourceType.Connection;
    source: {
        fieldName: string;
    };
};

export type DashTabItemControlConnection = DashTabItemControlCommonData &
    DashTabItemControlConnectionSource;

type DashTabItemControlManualSource = {
    sourceType: DashTabItemControlSourceType.Manual;
    source: {
        fieldName: string;
        fieldType: string;
        acceptableValues:
            | {
                  // elementType: s;
                  values: string[];
              }
            | {
                  // elementType: date
                  from: string;
                  to: string;
              };
    } & DashTabItemControlElement;
};
export type DashTabItemControlManual = DashTabItemControlCommonData &
    DashTabItemControlManualSource;

export type DashTabItemControlElement =
    | DashTabItemControlElementSelect
    | DashTabItemControlElementInput
    | DashTabItemControlElementDate
    | DashTabItemControlElementCheckbox;

export enum TitlePlacementOption {
    Left = 'left',
    Top = 'top',
}

export const TitlePlacements = {
    Hide: 'hide' as const,
    Left: TitlePlacementOption.Left,
    Top: TitlePlacementOption.Top,
};

export type TitlePlacement = ValueOf<typeof TitlePlacements>;

export type AccentTypeValue = 'info' | null;

export interface DashTabItemControlElementBase {
    showTitle: boolean;
    titlePlacement?: TitlePlacementOption;
    elementType: DashTabItemControlElementType;
    operation?: Operations;
    showInnerTitle?: boolean;
    innerTitle?: string;
    fieldType?: string;
    required?: boolean;
    showHint?: boolean;
    hint?: string;
    accentType?: AccentTypeValue;
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

export interface DashTabItemControlElementCheckbox extends DashTabItemControlElementBase {
    elementType: DashTabItemControlElementType.Checkbox;
    defaultValue: string;
}

type DashTabItemControlExternalSource = {
    sourceType: DashTabItemControlSourceType.External;
    source: {
        chartId: string;
    };
};
export type DashTabItemControlExternal = DashTabItemControlCommonData &
    DashTabItemControlExternalSource;

export interface DashTabItemGroupControl extends DashTabItemBase {
    type: DashTabItemType.GroupControl;
    data: DashTabItemGroupControlData;
    defaults: StringParams;
}

export interface DashTabItemGroupControlData {
    showGroupName: boolean;
    groupName?: string;
    autoHeight: boolean;
    buttonApply: boolean;
    buttonReset: boolean;

    updateControlsOnChange?: boolean;

    group: DashTabItemControlSingle[];
}

export interface DashTabLayout {
    h: number;
    i: string;
    w: number;
    x: number;
    y: number;
    parent?: string;
}

export interface DashTabAliases extends Dictionary<Array<string[]>> {}

export interface DashTabConnection {
    from: string;
    to: string;
    kind: DashTabConnectionKind;
}

export interface DashStateData
    extends Dictionary<{
        params: StringParams;
        state: {
            // for chart state
            tabId: string;
        };
    }> {}

export interface DashStats {
    dashId: string;
    dashTabId: string;
    dashStateHash: string | null;
    login?: string;
    userId: string;
    tenantId: string;
    traceId?: string;
}

export interface DashTabItemImage extends DashTabItemBase {
    type: DashTabItemType.Image;
    data: {
        src: string;
        alt?: string;
        background?: BackgroundSettings;
        preserveAspectRatio?: boolean;
    };
}
