import React from 'react';

import {I18n} from 'i18n';

import ViewError from '../../../../components/ViewError/ViewError';
import {DashErrorCode} from '../../modules/constants';

const i18n = I18n.keyset('dash.error.view');

const getErrorView = (error: Error | null, onRetry: () => void) => {
    if (!error || !('code' in error)) {
        return {retry: onRetry};
    }

    switch (error.code) {
        case DashErrorCode.NOT_FOUND:
            return {
                description: i18n('label_error-404-message'),
                retry: onRetry,
            };
        case DashErrorCode.LIMIT_EXCEED:
            return {
                title: i18n('label_title-embed-dash-limit-reached'),
                description: i18n('label_description-embed-dash-limit-reached'),
            };
        default:
            return {
                retry: onRetry,
            };
    }
};

export const DashError = ({
    error,
    onRetry,
    hideDetails,
}: {
    error: Error | null;
    onRetry: () => void;
    hideDetails?: boolean;
}) => {
    const {title, description, retry} = getErrorView(error, onRetry);

    return (
        <ViewError
            title={title}
            description={description}
            error={error}
            retry={retry}
            hideDetails={hideDetails}
        />
    );
};
