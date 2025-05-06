import React from 'react';

import type {DATASET_FIELD_TYPES, DatasetField} from 'shared';

import {validateParameterName} from '../../utils/validation';

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
    isFormValid: boolean;
    isNameValid: boolean;
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

    const nameRef = React.useRef(name);
    const [state, setState] = React.useState<ParameterFormState>({
        name,
        type,
        defaultValue,
        template_enabled,
        value_constraint,
    });
    const [isFormValid, setIsFormValid] = React.useState<boolean>(false);
    const [isNameValid, setIsNameValid] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (state.name !== nameRef.current) {
            nameRef.current = state.name;
            setIsNameValid(validateParameterName(state.name));
        }

        const isFieldsEmpty = state.name === '' || state.defaultValue === '';
        setIsFormValid(!isFieldsEmpty && isNameValid);
    }, [isNameValid, state]);

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
    }, [fieldId, getOriginalField]);

    return {
        formState: state,
        updateFormState: updateParameterForm,
        resetFormState: resetParameterForm,
        isFormValid,
        isNameValid,
    };
};
