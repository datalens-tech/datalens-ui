import React from 'react';

import {I18n} from 'i18n';

import {getValidationErrors} from './helpers';

const i18n = I18n.keyset('component.dialog-parameter');

export const useValidationErrors = (
    args: Parameters<typeof getValidationErrors>[0] & {isSubmitted?: boolean},
) => {
    const {name, type, defaultValue, isSubmitted} = args;
    const isSubmittedAtLeastOnce = React.useRef(false);
    const [validationErrors, setValidationErrors] = React.useState(
        getValidationErrors({
            name,
            type,
            defaultValue,
        }),
    );

    React.useEffect(() => {
        if (isSubmitted && !isSubmittedAtLeastOnce.current) {
            isSubmittedAtLeastOnce.current = true;
        }
    }, [isSubmitted]);

    React.useEffect(() => {
        const newErrors = getValidationErrors({
            name,
            type,
            defaultValue,
        });

        if (isSubmittedAtLeastOnce.current) {
            if (!name && !newErrors.name) {
                newErrors.name = i18n('label_required-field-error');
            }
            if (!defaultValue && !newErrors.defaultValue) {
                newErrors.defaultValue = i18n('label_required-field-error');
            }
        }

        setValidationErrors(newErrors);
    }, [defaultValue, name, type, isSubmitted]);

    return {
        validationErrors,
        setValidationErrors,
    };
};
