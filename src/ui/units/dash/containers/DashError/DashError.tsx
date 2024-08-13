import React from 'react';

import {I18n} from 'i18n';

import ViewError from '../../../../components/ViewError/ViewError';
import {DashErrorCode} from '../../modules/constants';

const i18n = I18n.keyset('dash.error.view');

export const DashError = ({
    error,
    onRetry,
    hideDetails,
}: {
    error: Error | null;
    onRetry: () => void;
    hideDetails?: boolean;
}) => {
    let customErrorMessage = '';

    if (error && 'code' in error) {
        switch (error.code) {
            case DashErrorCode.NOT_FOUND:
                customErrorMessage = i18n('label_error-404-message');
                break;
            case DashErrorCode.SECRET_ACCESS_DENIED:
                customErrorMessage = i18n('label_error-access-message');
                break;
        }
    }

    return (
        <ViewError
            description={customErrorMessage}
            error={error}
            retry={onRetry}
            hideDetails={hideDetails}
        />
    );
};
