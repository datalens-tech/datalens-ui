import type {ConnectionQueryTypeValues} from 'shared';
import type {Operations} from 'shared/modules';
import type {
    ConnectionQueryContent,
    DATASET_FIELD_TYPES,
    DashTabItemControlSourceType,
    DatasetFieldType,
    TitlePlacementOption,
} from 'shared/types';

import type {SelectorDialogState} from '../dashTyped';

export type SelectorDialogValidation = {
    title?: string;
    uniqueFieldName?: string;
    fieldName?: string;
    datasetFieldId?: string;
    defaultValue?: string;
    connectionQueryContent?: string;
    selectorParameters?: string;
};

// TODO REMOVE
export type SelectorsGroupDialogState = {
    autoHeight: boolean;
    buttonApply: boolean;
    buttonReset: boolean;
    updateControlsOnChange: boolean;
    group: SelectorDialogState[];
};

export type SelectorSourceType =
    | DashTabItemControlSourceType.Dataset
    | DashTabItemControlSourceType.Manual
    | DashTabItemControlSourceType.External
    | DashTabItemControlSourceType.Connection;

export type ItemDataSource = {
    chartId?: string;
    showTitle?: boolean;
    titlePlacement?: TitlePlacementOption;
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
