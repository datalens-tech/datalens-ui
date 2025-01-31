import React from 'react';

import {batch, useDispatch, useSelector} from 'react-redux';

import {ValidationErrorType} from '../../../../constants';
import {
    changeForm,
    changeInnerForm,
    formSelector,
    innerFormSelector,
    setValidationErrors,
    validationErrorsSelector,
} from '../../../../store';
import type {ValidationError} from '../../../../typings';
import {getValidationError} from '../../../../utils';

import type {KeyValueEntry, KeyValueProps} from './types';

type KeyValueResult = {
    entries: Record<string, KeyValueEntry['value']>;
};

const initialEntriesToKeyValues = (entries: KeyValueResult['entries'] = {}): KeyValueEntry[] => {
    return Object.entries(entries).map(([key, value]) => {
        return {key, value, initial: true};
    });
};

const keyValuesToEntries = (keyValues: KeyValueEntry[] = []): KeyValueResult['entries'] => {
    return keyValues.reduce<KeyValueResult['entries']>(
        (acc, {key, value, error, initial, touched}) => {
            if (key && !error && (!initial || (initial && touched))) {
                acc[key] = value;
            }
            return acc;
        },
        {},
    );
};

const getValidatedKeyValues = (keyValues: KeyValueEntry[]) => {
    return keyValues.map((item, index) => {
        const resultItem = {...item};
        const hasDuplicatedKey = keyValues.some(
            ({key}, innerIndex) => innerIndex !== index && key && key === item.key,
        );
        if (hasDuplicatedKey) {
            resultItem.error = 'duplicated-key';
        } else {
            resultItem.error = undefined;
        }
        return resultItem;
    });
};

export function useKeyValueProps(props: KeyValueProps) {
    const {name, inner, keys = [], keySelectProps, valueInputProps, secret} = props;
    const dispatch = useDispatch();
    const form = useSelector(formSelector);
    const innerForm = useSelector(innerFormSelector);
    const validationErrors = useSelector(validationErrorsSelector);
    const value = (inner ? innerForm[name] : form[name]) as KeyValueResult | undefined;
    const error = getValidationError(name, validationErrors);
    const hasRequiredError =
        validationErrors.find((e) => e.name === props.name)?.type === ValidationErrorType.Required;

    const updateForm = (nextKeyValues: KeyValueEntry[]) => {
        const validatedNextKeyValues = getValidatedKeyValues(nextKeyValues);
        const entries = keyValuesToEntries(validatedNextKeyValues);
        const formUpdates: KeyValueResult | undefined =
            Object.keys(entries).length === 0
                ? undefined
                : {
                      entries: keyValuesToEntries(validatedNextKeyValues),
                  };

        batch(() => {
            if (inner) {
                dispatch(changeInnerForm({[name]: formUpdates}));
            } else {
                dispatch(changeForm({[name]: formUpdates}));
            }

            const hasErrors = validatedNextKeyValues.some((keyValue) => Boolean(keyValue.error));

            if (hasErrors) {
                const errors: ValidationError[] = [
                    ...validationErrors,
                    {type: ValidationErrorType.DuplicatedKey, name},
                ];
                dispatch(setValidationErrors({errors}));
            } else if (error) {
                const errors = validationErrors.filter((err) => err.name !== error.name);
                dispatch(setValidationErrors({errors}));
            }
        });
    };

    return {hasRequiredError, value, keys, keySelectProps, valueInputProps, secret, updateForm};
}

export function useKeyValueState(props: {
    value: KeyValueResult | undefined;
    updateForm: (nextKeyValues: KeyValueEntry[]) => void;
}) {
    const {value, updateForm} = props;
    const [keyValues, setKeyValues] = React.useState<KeyValueEntry[]>(
        initialEntriesToKeyValues(value?.entries),
    );

    const updateKeyValues = (nextKeyValues: KeyValueEntry[]) => {
        const validatedNextKeyValues = getValidatedKeyValues(nextKeyValues);
        updateForm(validatedNextKeyValues);
        setKeyValues(validatedNextKeyValues);
    };

    const handleAddKeyValue = () => {
        updateKeyValues([...keyValues, {key: '', value: ''}]);
    };

    const handleUpdateKeyValue = (index: number, updates: Partial<KeyValueEntry>) => {
        const nextKeyValues = [...keyValues];
        const updatedKeyValue = nextKeyValues[index];
        nextKeyValues[index] = {
            ...updatedKeyValue,
            ...updates,
            touched: true,
        };
        updateKeyValues(nextKeyValues);
    };

    const handleDeleteKeyValue = (index: number) => {
        const deletedItem = keyValues[index];
        const nextKeyValues: KeyValueEntry[] = deletedItem.initial
            ? [
                  ...keyValues.slice(0, index),
                  {key: deletedItem.key, value: null},
                  ...keyValues.slice(index + 1),
              ]
            : [...keyValues.slice(0, index), ...keyValues.slice(index + 1)];
        updateKeyValues(nextKeyValues);
    };

    return {keyValues, handleAddKeyValue, handleUpdateKeyValue, handleDeleteKeyValue};
}
