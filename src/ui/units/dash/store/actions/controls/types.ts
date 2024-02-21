import type {Operations} from 'shared/modules';
import {DATASET_FIELD_TYPES, DashTabItemControlSourceType, DatasetFieldType} from 'shared/types';

import {SelectorDialogState} from '../dashTyped';

export type SelectorDialogValidation = {
    title?: string;
    fieldName?: string;
    datasetFieldId?: string;
    defaultValue?: string;
};

export type SelectorsGroupDialogState = {
    autoHeight: boolean;
    buttonApply: boolean;
    buttonReset: boolean;
    defaults?: Record<string, string | string[]>;
    items: SelectorDialogState[];
    id?: string;
};

export type SelectorSourceType =
    | DashTabItemControlSourceType.Dataset
    | DashTabItemControlSourceType.Manual
    | DashTabItemControlSourceType.External
    | DashTabItemControlSourceType.Connection;

export type ItemDataSource = {
    chartId?: string;
    showTitle?: boolean;
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
};
