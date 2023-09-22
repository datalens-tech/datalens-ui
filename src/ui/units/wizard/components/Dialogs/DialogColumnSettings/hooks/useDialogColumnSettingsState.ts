import React from 'react';

import {ColumnSettings, DATASET_FIELD_TYPES, DatasetFieldType} from 'shared';

import {DialogColumnSettingsFields} from '../DialogColumnSettings';
import {mapFieldsToColumnSettingsState} from '../utils';

type UseDialogColumnSettingsStateArgs = {
    initialFields: DialogColumnSettingsFields;
};

export type PartialField = {
    columnSettings: ColumnSettings;
    title: string;
    data_type: DATASET_FIELD_TYPES;
    type: DatasetFieldType;
    fieldPlaceholder: 'columns' | 'rows';
};

export type ColumnSettingsState = Record<string, PartialField>;

export const useDialogColumnSettingsState = (args: UseDialogColumnSettingsStateArgs) => {
    const {initialFields} = args;

    const {columns, rows} = React.useMemo(() => {
        return mapFieldsToColumnSettingsState(initialFields);
    }, [initialFields]);

    const resetState = React.useMemo(() => {
        return mapFieldsToColumnSettingsState(initialFields, true);
    }, [initialFields]);

    const [fields, setFields] = React.useState<{
        columns: ColumnSettingsState;
        rows: ColumnSettingsState;
    }>({columns, rows});

    const [errors, setErrors] = React.useState<Record<string, boolean>>({});

    const handleOnResetClick = React.useCallback(() => {
        setFields({columns: resetState.columns, rows: resetState.rows});
        setErrors({});
    }, [resetState]);

    const handleWidthUpdate = React.useCallback(
        (
            fieldId: string,
            widthSettings: Partial<ColumnSettings['width']>,
            fieldPlaceholder: 'columns' | 'rows',
        ) => {
            setFields((prevState) => {
                const prevField = prevState[fieldPlaceholder][fieldId];
                const prevColumnSettings = prevField.columnSettings;
                const prevWidthSettings = prevColumnSettings.width || {};

                return {
                    ...prevState,
                    [fieldPlaceholder]: {
                        ...prevState[fieldPlaceholder],
                        [fieldId]: {
                            ...prevField,
                            fieldPlaceholder,
                            columnSettings: {
                                ...prevColumnSettings,
                                width: {
                                    ...prevWidthSettings,
                                    ...widthSettings,
                                },
                            },
                        },
                    },
                };
            });
        },
        [],
    );

    const handleErrorOccurred = React.useCallback((fieldId: string, error: boolean) => {
        setErrors((prevState) => {
            return {
                ...prevState,
                [fieldId]: error,
            };
        });
    }, []);

    return {
        fields,
        handleOnResetClick,
        handleWidthUpdate,
        errors,
        handleErrorOccurred,
    };
};
