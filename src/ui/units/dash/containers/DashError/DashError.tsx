import React from 'react';

import {I18n} from 'i18n';
import {ErrorContentTypes} from 'shared';

import ViewError from '../../../../components/ViewError/ViewError';
import {DashErrorCode} from '../../modules/constants';

const i18n = I18n.keyset('dash.error.view');

type DashErrorProps = {
    error: Error | null;
    onRetry: () => void;
    hideDetails?: boolean;
};

const getErrorView = ({error, onRetry}: DashErrorProps) => {
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
                type: ErrorContentTypes.EMBEDDED_DASH_LIMIT_REACHED,
                title: i18n('label_title-embed-dash-limit-reached'),
                description: i18n('label_description-embed-dash-limit-reached'),
            };
        default:
            return {
                retry: onRetry,
            };
    }
};

export const DashError = ({error, onRetry, hideDetails}: DashErrorProps) => {
    const {type, title, description, retry} = getErrorView({error, onRetry});

    return (
        <ViewError
            type={type}
            title={title}
            description={description}
            error={error}
            retry={retry}
            hideDetails={hideDetails}
        />
    );
};
