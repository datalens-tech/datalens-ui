import type {ConnectionQueryTypeValues} from 'shared/constants';
import type {Operations} from 'shared/modules';
import type {
    AccentTypeValue,
    ConnectionQueryContent,
    ConnectionQueryTypeOptions,
    DATASET_FIELD_TYPES,
    DashTabItemControlSourceType,
    DashTabItemType,
    Dataset,
    DatasetFieldType,
    StringParams,
    TitlePlacement,
    TitlePlacementOption,
} from 'shared/types';

import type {DialogTitleWidgetFeatureProps} from 'ui/components/DialogTitleWidget/DialogTitleWidget';
import type {DialogTextWidgetFeatureProps} from 'ui/components/DialogTextWidget/DialogTextWidget';
import type {DialogChartWidgetFeatureProps} from 'ui/components/DialogChartWidget/DialogChartWidget';
import type {DialogGroupControlFeaturesProps} from 'ui/components/DialogGroupControl/DialogGroupControl';
import type {DialogExternalControlFeaturesProps} from 'ui/components/DialogExternalControl/DialogExternalControl';
import type {DialogImageWidgetFeatureProps} from 'ui/components/DialogImageWidget';

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
};

export type SelectorsGroupDialogState = {
    showGroupName: boolean;
    groupName?: string;
    autoHeight: boolean;
    buttonApply: boolean;
    buttonReset: boolean;
    updateControlsOnChange: boolean;
    group: SelectorDialogState[];
};

export type SelectorElementType = 'select' | 'date' | 'input' | 'checkbox';

export type SelectorSourceType =
    | DashTabItemControlSourceType.Dataset
    | DashTabItemControlSourceType.Manual
    | DashTabItemControlSourceType.External
    | DashTabItemControlSourceType.Connection;

export type ItemDataSource = {
    chartId?: string;
    showTitle?: boolean;
    titlePlacement?: TitlePlacementOption;
    accentType?: AccentTypeValue;
    elementType?: string;
    defaultValue?: string | string[];
    datasetId?: string;
    datasetFieldId?: string;
    fieldName?: string;
    fieldType?: DATASET_FIELD_TYPES;
    datasetFieldType?: DatasetFieldType;
    acceptableValues?: Array<Record<string, any>>;
    isRange?: boolean;
    multiselectable?: boolean;
    operation?: Operations;
    showInnerTitle?: boolean;
    innerTitle?: string;
    required?: boolean;
    connectionId?: string;
    connectionQueryType?: ConnectionQueryTypeValues;
    connectionQueryContent?: ConnectionQueryContent;
    showHint?: boolean;
    hint?: string;
};

export type AcceptableValue = {
    title: string;
    value: string;
};

export type SelectorDialogState = {
    title?: string;
    titlePlacement?: TitlePlacement;

    innerTitle?: string;
    sourceType?: SelectorSourceType;
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
};

export type SetSelectorDialogItemArgs = Partial<SelectorDialogState>;
