import React from 'react';

type CollectionEntityDialogErrors<VT> = Partial<Record<keyof VT, string>>;

export const useCollectionEntityDialogState = <VT extends Record<string, unknown>>(
    initialValues: VT,
) => {
    const [values, setValues] = React.useState<VT>(initialValues);
    const [errors, setErrors] = React.useState<CollectionEntityDialogErrors<VT>>({});

    const handleChange = React.useCallback((nextValues: Partial<VT>): void => {
        setValues((prevValues) => ({...prevValues, ...nextValues}));
        setErrors((prevErrors) => {
            if (Object.keys(prevErrors).length < 1) {
                return prevErrors;
            }

            const nextDialogErrors = {...prevErrors};

            for (const fieldName in nextValues) {
                if (fieldName in nextDialogErrors) {
                    delete nextDialogErrors[fieldName as keyof VT];
                }
            }

            return nextDialogErrors;
        });
    }, []);

    const handleError = React.useCallback((nextErrors: CollectionEntityDialogErrors<VT>): void => {
        setErrors((prevErrors) => ({
            ...prevErrors,
            ...nextErrors,
        }));
    }, []);

    return {values, errors, handleChange, handleError};
};
