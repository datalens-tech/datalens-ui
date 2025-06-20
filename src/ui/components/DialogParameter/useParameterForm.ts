import React from 'react';

import type {DATASET_FIELD_TYPES, DatasetField} from 'shared';

export type UseParameterFormArgs = {
    getOriginalField?: (fieldId: string) => DatasetField | undefined;
    fieldId: string;
} & ParameterFormState;

export type ParameterFormState = {
    name: string;
    type: DATASET_FIELD_TYPES;
    defaultValue: string;
} & Pick<DatasetField, 'template_enabled' | 'value_constraint'>;

type UpdateParameterArgs = {
    [K in keyof ParameterFormState]?: ParameterFormState[K];
};

export type UseParameterFormReturnValue = {
    formState: ParameterFormState;
    updateFormState: (args: UpdateParameterArgs) => void;
    resetFormState: () => void;
};

export const useParameterForm = (args: UseParameterFormArgs): UseParameterFormReturnValue => {
    const {
        name,
        fieldId,
        getOriginalField,
        type,
        defaultValue,
        template_enabled,
        value_constraint,
    } = args;

    const [state, setState] = React.useState<ParameterFormState>({
        name,
        type,
        defaultValue,
        template_enabled,
        value_constraint,
    });

    const updateParameterForm = React.useCallback((updates: UpdateParameterArgs) => {
        setState((prevState) => ({...prevState, ...updates}));
    }, []);

    const resetParameterForm = React.useCallback(() => {
        if (getOriginalField) {
            const originalField = getOriginalField(fieldId);
            setState((prevState) => ({
                ...prevState,
                defaultValue: String(originalField?.default_value) || defaultValue,
            }));
        }
    }, [defaultValue, fieldId, getOriginalField]);

    return {
        formState: state,
        updateFormState: updateParameterForm,
        resetFormState: resetParameterForm,
    };
};
