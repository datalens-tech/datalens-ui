import React from 'react';

import type {DataLensApiError} from 'ui';
import {Utils} from 'ui';

import ErrorText from '../../ErrorText/ErrorText';

import {hasAtLeastOneFilledValue} from './utils';

type Props = {error?: DataLensApiError; details?: string};

const flatDetails = (details: object) => {
    const values = Object.values(details);

    if (values.length === 1 && typeof values[0] === 'string') {
        return values[0];
    }
    return JSON.stringify(details, null, 4);
};

const DebugTab: React.FC<Props> = (props: Props) => {
    if ('details' in props && props.details) {
        return <ErrorText errorMessage={props.details} />;
    }

    if ('error' in props && props.error) {
        const errorDetails = Utils.getErrorDetails(props.error);

        if (!errorDetails) {
            return null;
        }

        const errorContent: string[] = [];

        const errorValues = Object.values(errorDetails);
        errorValues.forEach((value) => {
            if (typeof value === 'string') {
                errorContent.push(value);
            } else if (typeof value === 'object' && hasAtLeastOneFilledValue(value)) {
                errorContent.push(flatDetails(value));
            }
        });

        const errorMessage = errorContent.join('\n\n');

        return <ErrorText errorMessage={errorMessage} />;
    }

    return null;
};

export default DebugTab;
