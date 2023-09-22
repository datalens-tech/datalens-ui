import React from 'react';

import DatalensChartkitCustomError, {
    formatError,
} from '../../../../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import settings from '../../../../modules/settings/settings';
import {CombinedError, OnChangeData} from '../../../../types';
import {ErrorProps} from '../../../Error/Error';
import {ChartKitBaseWrapperProps, ChartKitWrapperState} from '../../types';

type ChartkitErrorProps = {
    onRetry?: (data?: OnChangeData['data']) => void;
    error: CombinedError;
    requestId: ChartKitWrapperState['requestId'];
    noControls: ChartKitBaseWrapperProps['noControls'];
};

export const ChartkitError = ({error, onRetry, requestId, noControls}: ChartkitErrorProps) => {
    const ErrorComponent = settings.ErrorComponent as React.ComponentType<ErrorProps>;

    const formattedError = formatError({
        error,
        requestId,
        noControls,
    });

    const onError = settings.onError;
    if (typeof onError === 'function') {
        (onError as (err: Error, formatted: DatalensChartkitCustomError) => void)(
            error,
            formattedError,
        );
    }

    const handleRetry = React.useCallback(
        (data) => {
            onRetry?.(data);
        },
        [onRetry],
    );

    return <ErrorComponent error={formattedError} onAction={handleRetry} />;
};
