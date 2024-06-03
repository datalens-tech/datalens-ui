import React from 'react';

import type {DATASET_FIELD_TYPES, DatasetField} from 'shared';
import {isDateField} from 'shared';

import {validateParameterName} from '../../utils/validation';

export type UseParameterFormArgs = {
    getOriginalField?: (fieldId: string) => DatasetField | undefined;
    fieldId: string;
} & ParameterFormState;

export type ParameterFormState = {
    name: string;
    type: DATASET_FIELD_TYPES;
    defaultValue: string;
};

type UpdateParameterArgs = {
    key: keyof ParameterFormState;
    value: string;
};

type UseParameterFormReturnValue = {
    formState: ParameterFormState;
    updateFormState: (args: UpdateParameterArgs) => void;
    resetFormState: () => void;
    isFormValid: boolean;
    isNameValid: boolean;
};

export const useParameterForm = (args: UseParameterFormArgs): UseParameterFormReturnValue => {
    const {name, fieldId, getOriginalField, type, defaultValue} = args;

    const nameRef = React.useRef(name);
    const prevTypeRef = React.useRef(type);
    const [state, setState] = React.useState<ParameterFormState>({name, type, defaultValue});
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

    React.useEffect(() => {
        const isCurrentTypeDate = isDateField({data_type: state.type});
        const isPrevTypeDate = isDateField({data_type: prevTypeRef.current});

        if (isCurrentTypeDate || isPrevTypeDate) {
            setState((prevState) => ({...prevState, defaultValue: ''}));
        }
        prevTypeRef.current = state.type;
    }, [state.type]);

    const updateParameterForm = React.useCallback(({key, value}: UpdateParameterArgs) => {
        setState((prevState) => ({...prevState, [key]: value}));
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
