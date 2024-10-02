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
    const message =
        error && 'code' in error && error.code === DashErrorCode.NOT_FOUND
            ? i18n('label_error-404-message')
            : '';

    return (
        <ViewError description={message} error={error} retry={onRetry} hideDetails={hideDetails} />
    );
};
