import React from 'react';

import {QLParamInterval, QLParamType} from '../../../../../../../shared';

import {resolveAndFormatDate} from './utils';

export const OverridenValue = ({
    overridenValue,
    type,
    paramIsInterval,
    paramIsDate,
}: {
    overridenValue: string | string[] | QLParamInterval;
    type: QLParamType;
    paramIsInterval: boolean;
    paramIsDate: boolean;
}) => {
    if (
        paramIsInterval &&
        typeof overridenValue === 'object' &&
        !Array.isArray(overridenValue) &&
        overridenValue.from &&
        overridenValue.to
    ) {
        return (
            <React.Fragment>
                {resolveAndFormatDate(overridenValue.from, type as QLParamType)}
                <span> — </span>
                {resolveAndFormatDate(overridenValue.to, type as QLParamType)}
            </React.Fragment>
        );
    } else if (paramIsDate && typeof overridenValue === 'string') {
        return (
            <React.Fragment>
                {resolveAndFormatDate(overridenValue, type as QLParamType)}
            </React.Fragment>
        );
    } else {
        return <React.Fragment>{JSON.stringify(overridenValue)}</React.Fragment>;
    }
};
