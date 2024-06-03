import type {ColumnSettings, Field, HierarchyField, WidthAutoSetting} from 'shared';
import {DatasetFieldType, isFieldHierarchy, isParameter} from 'shared';

import type {DialogColumnSettingsFields} from '../DialogColumnSettings';
import type {ColumnSettingsState, PartialField} from '../hooks/useDialogColumnSettingsState';

export const getDefaultColumnWidthSettings = (): WidthAutoSetting => ({
    mode: 'auto',
});

const getDatasetFieldType = (field: Field | HierarchyField): DatasetFieldType => {
    if (isParameter(field)) {
        return DatasetFieldType.Parameter;
    }

    if (isFieldHierarchy(field)) {
        return DatasetFieldType.Dimension;
    }

    return field.type;
};

const extractColumnSettings = (field: Field | HierarchyField): ColumnSettings => {
    if (isFieldHierarchy(field)) {
        // The same columnSettings are used for all hierarchies.
        return (field as HierarchyField).fields[0].columnSettings || ({} as ColumnSettings);
    }
    return field.columnSettings || ({} as ColumnSettings);
};

export const getMappedColumnSettingsField = (
    acc: ColumnSettingsState,
    currField: Field,
    {
        isResetState,
        fieldPlaceholder,
    }: {isResetState?: boolean; fieldPlaceholder: 'columns' | 'rows'},
) => {
    const columnSettings: ColumnSettings = isResetState
        ? {width: getDefaultColumnWidthSettings()}
        : extractColumnSettings(currField);

    const type: DatasetFieldType = getDatasetFieldType(currField);

    const partialField: PartialField = {
        columnSettings,
        title: currField.fakeTitle || currField.title,
        data_type: currField.data_type,
        type,
        fieldPlaceholder,
    };
    return {
        ...acc,
        [currField.guid]: partialField,
    };
};

export const mapFieldsToColumnSettingsState = (
    fields: DialogColumnSettingsFields,
    isResetState?: boolean,
): {columns: ColumnSettingsState; rows: ColumnSettingsState} => {
    const columns = fields.columns.reduce(
        (acc, field) =>
            getMappedColumnSettingsField(acc, field, {isResetState, fieldPlaceholder: 'columns'}),
        {} as ColumnSettingsState,
    );

    const rows = fields.rows.reduce(
        (acc, field) =>
            getMappedColumnSettingsField(acc, field, {isResetState, fieldPlaceholder: 'rows'}),
        {} as ColumnSettingsState,
    );

    return {
        columns,
        rows,
    };
};
