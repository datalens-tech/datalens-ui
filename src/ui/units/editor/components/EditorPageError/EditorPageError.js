import React from 'react';

import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {ErrorContentTypes} from 'shared';
import {ErrorContent, Utils} from 'ui';

function ViewError({retry, error = {}, entryId}) {
    const {status, message} = Utils.parseErrorResponse(error);

    function getErrorMessage() {
        switch (status) {
            case 403:
            case ErrorContentTypes.NO_ACCESS:
                return {
                    type: ErrorContentTypes.NO_ENTRY_ACCESS,
                    title: i18n('datalens.landing.error', 'label_title-forbidden-entry'),
                    entryId,
                };
            case 404:
            case ErrorContentTypes.NOT_FOUND:
                return {
                    type: 'not-found',
                    title: i18n('editor.editor-page-error.view', 'label_error-404-title'),
                };
            case 500:
            case ErrorContentTypes.ERROR:
            default:
                return {
                    type: 'error',
                    title: i18n('editor.editor-page-error.view', 'label_error-500-title'),
                    action: {
                        text: i18n('editor.editor-page-error.view', 'button_retry'),
                        handler: retry,
                    },
                };
        }
    }

    const {type, title, action, ...restProps} = getErrorMessage();

    return (
        <ErrorContent
            type={type}
            title={title}
            description={message}
            error={error}
            action={action}
            {...restProps}
        />
    );
}

ViewError.propTypes = {
    retry: PropTypes.func.isRequired,
    error: PropTypes.object,
    entryId: PropTypes.string,
};

export default ViewError;
