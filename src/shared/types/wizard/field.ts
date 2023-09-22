import {FilterBody} from '../charts';
import {ServerField} from '../config';
import {DATASET_FIELD_TYPES, DatasetField, DatasetFieldType} from '../dataset';

import {TableFieldBackgroundSettings} from './background-settings';
import {TableBarsSettings} from './bars';
import {ColumnSettings} from './column';
import {
    CommonNumberFormattingOptions,
    FloatNumberFormattingOptions,
    IntegerNumberFormattingOptions,
} from './formatting';
import {TableFieldDisplayMode} from './misc';
import {TableSubTotalsSettings} from './sub-totals';

export interface WizardDatasetField extends DatasetField {
    datasetName: string;
    datasetId: string;
    fakeTitle?: string;
    grouping?: string;
    id?: string;
    format?: string;
    originalTitle?: string;
    conflict?: string;
    direction?: string;
    mode?: string;
    disabled?: string;
    className?: string;
    new_id?: string;
    originalFormula?: string;
    originalSource?: string;
    hideLabelMode?: 'hide' | 'show';
    formatting?: CommonNumberFormattingOptions;
    originalDateCast: unknown;
    undragable?: boolean;
    transformed?: boolean;
    quickFormula?: boolean;
    unsaved?: boolean;
    local?: boolean;
    filter?: FilterBody;
    barsSettings?: TableBarsSettings;
    subTotalsSettings?: TableSubTotalsSettings;
    columnSettings?: ColumnSettings;
    backgroundSettings?: TableFieldBackgroundSettings;
    distincts?: string[];
    displayMode?: TableFieldDisplayMode;
}

export interface FilterField extends WizardDatasetField {
    filter: FilterBody;
    is_default_filter?: boolean;
}

export interface IntegerField extends WizardDatasetField {
    data_type: DATASET_FIELD_TYPES.INTEGER | DATASET_FIELD_TYPES.UINTEGER;
    formatting?: IntegerNumberFormattingOptions;
}

export interface FloatField extends WizardDatasetField {
    data_type: DATASET_FIELD_TYPES.FLOAT;
    formatting?: FloatNumberFormattingOptions;
}

export type NumberField = IntegerField | FloatField;

export interface DateField extends WizardDatasetField {
    data_type: DATASET_FIELD_TYPES.DATE;
    format: string;
}

export interface DatetimeField extends WizardDatasetField {
    data_type: DATASET_FIELD_TYPES.DATETIME;
    format: string;
}

export interface GenericDatetimeField extends WizardDatasetField {
    data_type: DATASET_FIELD_TYPES.GENERICDATETIME;
    format: string;
}

export interface HierarchyField extends WizardDatasetField {
    data_type: DATASET_FIELD_TYPES.HIERARCHY;
    fields: Field[];
    type: DatasetFieldType.Pseudo;
}

export interface MarkupField extends WizardDatasetField {
    data_type: DATASET_FIELD_TYPES.MARKUP;
}

export type Field =
    | HierarchyField
    | IntegerField
    | FloatField
    | DateField
    | DatetimeField
    | GenericDatetimeField
    | WizardDatasetField;

export type FieldGuid = string;

export function isIntegerField(field: {data_type: string}): field is IntegerField {
    return (
        field.data_type === DATASET_FIELD_TYPES.INTEGER ||
        field.data_type === DATASET_FIELD_TYPES.UINTEGER
    );
}

export function isFloatField(field: {data_type: string}): field is FloatField {
    return field.data_type === DATASET_FIELD_TYPES.FLOAT;
}

export function isNumberField(field?: {data_type: string}): field is NumberField {
    return Boolean(field && (isIntegerField(field) || isFloatField(field)));
}

export function isMarkupField(field?: {data_type: string}): field is MarkupField {
    return Boolean(field && field.data_type === DATASET_FIELD_TYPES.MARKUP);
}

export function isDateField(field?: {
    data_type: string;
}): field is DateField | DatetimeField | GenericDatetimeField {
    return Boolean(field && isDateType(field?.data_type));
}

export function isDateType(dataType: string) {
    return Boolean(
        dataType === DATASET_FIELD_TYPES.DATE ||
            dataType === DATASET_FIELD_TYPES.DATETIME ||
            dataType === DATASET_FIELD_TYPES.GENERICDATETIME ||
            dataType === DATASET_FIELD_TYPES.DATETIMETZ,
    );
}

export const isFieldHierarchy = (field: Field | ServerField | undefined): field is HierarchyField =>
    field?.data_type === DATASET_FIELD_TYPES.HIERARCHY;
