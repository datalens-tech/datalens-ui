import type {ConnectionQueryTypeValues} from 'shared/constants';
import type {Operations} from 'shared/modules';
import type {
    AccentTypeValue,
    ConnectionQueryContent,
    ConnectionQueryTypeOptions,
    DATASET_FIELD_TYPES,
    DashItemControlConnectionBaseSource,
    DashItemControlDatasetBaseSource,
    DashItemControlExternalBaseSource,
    DashItemControlManualBaseSource,
    DashTabItemControlElementBase,
    DashTabItemControlElementSelectBase,
    DashTabItemControlElementDateBase,
    DashTabItemControlSourceType,
    DashTabItemType,
    Dataset,
    DatasetFieldType,
    ImpactTabsIds,
    StringParams,
    TitlePlacement,
    UniversalDefaultValue,
    DashTabItemControlElementType,
} from 'shared/types';

import type {DialogTitleWidgetFeatureProps} from 'ui/components/DialogTitleWidget/DialogTitleWidget';
import type {DialogTextWidgetFeatureProps} from 'ui/components/DialogTextWidget/DialogTextWidget';
import type {DialogChartWidgetFeatureProps} from 'ui/components/DialogChartWidget/DialogChartWidget';
import type {DialogGroupControlFeaturesProps} from 'ui/components/DialogGroupControl/DialogGroupControl';
import type {DialogExternalControlFeaturesProps} from 'ui/components/DialogExternalControl/DialogExternalControl';
import type {DialogImageWidgetFeatureProps} from 'ui/components/DialogImageWidget';
import type {ImpactType} from 'shared/types/dash';

export type DialogEditItemFeaturesProp = {
    [DashTabItemType.Title]?: DialogTitleWidgetFeatureProps;
    [DashTabItemType.Text]?: DialogTextWidgetFeatureProps;
    [DashTabItemType.Widget]?: DialogChartWidgetFeatureProps;
    [DashTabItemType.GroupControl]?: DialogGroupControlFeaturesProps;
    [DashTabItemType.Control]?: DialogExternalControlFeaturesProps;
    [DashTabItemType.Image]?: DialogImageWidgetFeatureProps;
};

export type SelectorDialogValidation = {
    title?: string;
    uniqueFieldName?: string;
    fieldName?: string;
    datasetFieldId?: string;
    chartId?: string;
    defaultValue?: string;
    connectionQueryContent?: string;
    selectorParameters?: string;
    impactType?: string;
    impactTabsIds?: string;
    currentTabVisibility?: string;
};

export type SelectorsGroupValidation = {
    impactTabsIds?: string;
    currentTabVisibility?: string;
};

export type SelectorsGroupDialogState = {
    showGroupName: boolean;
    groupName?: string;
    autoHeight: boolean;
    buttonApply: boolean;
    buttonReset: boolean;
    updateControlsOnChange: boolean;
    group: SelectorDialogState[];
    impactType?: ImpactType;
    impactTabsIds?: ImpactTabsIds;
    validation: SelectorsGroupValidation;
};

export type SelectorElementType = DashTabItemControlElementType;

export type SelectorSourceType =
    | DashTabItemControlSourceType.Dataset
    | DashTabItemControlSourceType.Manual
    | DashTabItemControlSourceType.External
    | DashTabItemControlSourceType.Connection;

export type ItemDataSource = {
    defaultValue?: UniversalDefaultValue;
} & Partial<DashTabItemControlElementBase> &
    Partial<DashTabItemControlElementSelectBase & DashTabItemControlElementDateBase> &
    Partial<DashItemControlManualBaseSource> &
    Partial<DashItemControlConnectionBaseSource> &
    Partial<DashItemControlDatasetBaseSource> &
    Partial<DashItemControlExternalBaseSource>;

export type AcceptableValue = {
    title: string;
    value: string;
};

export type SelectorDialogState = {
    title?: string;
    titlePlacement?: TitlePlacement;

    innerTitle?: string;
    sourceType: SelectorSourceType;
    autoHeight?: boolean;
    chartId?: string;
    showInnerTitle?: boolean;
    elementType: SelectorElementType;
    defaultValue?: string | string[];
    dataset?: Dataset;
    datasetId?: string;
    connectionId?: string;
    selectorParameters?: StringParams;
    selectorParametersGroup?: number;
    connectionQueryType?: ConnectionQueryTypeValues;
    connectionQueryTypes?: ConnectionQueryTypeOptions[];
    connectionQueryContent?: ConnectionQueryContent;
    datasetFieldId?: string;
    fieldName?: string;
    acceptableValues?: AcceptableValue[];
    isRange?: boolean;
    multiselectable?: boolean;
    defaults: Record<string, string | string[]>;
    required?: boolean;
    useDefaultValue?: boolean;
    usePreset?: boolean;
    operation?: Operations;
    validation: SelectorDialogValidation;
    isManualTitle?: boolean;
    fieldType?: DATASET_FIELD_TYPES;
    datasetFieldType?: DatasetFieldType;
    placementMode: 'auto' | '%' | 'px';
    width: string;
    id?: string;
    namespace?: string;
    showHint?: boolean;
    hint?: string;
    accentType?: AccentTypeValue;
    // unique id for manipulating selectors in the creation phase
    draftId?: string;
    // which tabs display the selector
    impactType?: ImpactType;
    impactTabsIds?: ImpactTabsIds;
};

export type PastedSelectorDialogState = SelectorDialogState & {
    originalId: string;
    targetEntryId: string;
    targetDashTabId: string;
};

export type SetSelectorDialogItemArgs = Partial<SelectorDialogState>;
