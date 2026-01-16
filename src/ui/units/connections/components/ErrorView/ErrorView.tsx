import React from 'react';

import type {ButtonButtonProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ErrorContentTypes} from 'shared';
import type {PartialBy} from 'shared';
import {ErrorContent} from 'ui';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import type {DataLensApiError} from '../../../../typings';
import Utils from '../../../../utils';

import './ErrorView.scss';

const b = block('conn-page-error');
const i18nForm = I18n.keyset('connections.form');
const i18nList = I18n.keyset('connections.connectors-list.view');

export type ErrorScope = 'connectors' | 'connection' | 'schema' | 'unknown';

export type ErrorContentAction = {
    text?: string;
    buttonProps?: Partial<ButtonButtonProps>;
    content?: React.ReactNode;
    handler?: () => void;
};

export type ErrorViewProps = {
    error: DataLensApiError;
    action?: PartialBy<ErrorContentAction, 'text'>;
    scope?: ErrorScope;
    className?: string;
    title?: string;
    description?: string;
    showDebugInfo?: boolean;
};

const getDefaultResultTitle = (scope?: ErrorScope) => {
    switch (scope) {
        case 'connectors': {
            return i18nList('label_error-500-title');
        }
        case 'schema': {
            return i18nList('label_error-500-schema');
        }
        default: {
            return i18nForm('label_error-500-title');
        }
    }
};

const getErrorData = (args: {
    status: number | null;
    scope?: ErrorScope;
    title?: string;
    description?: string;
}) => {
    const {status, scope, title, description} = args;

    switch (status) {
        case 400: {
            return {
                type: ErrorContentTypes.ERROR,
                title: title || i18nForm('label_error-400-title'),
                description,
            };
        }
        case 403: {
            return {
                type: ErrorContentTypes.NO_ACCESS,
                title: title || i18nForm('label_error-403-title'),
                description,
            };
        }
        case 404: {
            return {
                type: ErrorContentTypes.NOT_FOUND,
                title: title || i18nForm('label_error-404-title'),
                description,
            };
        }
        case 500:
        default: {
            return {
                type: ErrorContentTypes.ERROR,
                title: title || getDefaultResultTitle(scope),
                description,
            };
        }
    }
};

const getErrorAction = (action: NonNullable<ErrorViewProps['action']>): ErrorContentAction => {
    const {content, text, buttonProps, handler} = action;
    if (content) {
        return {content};
    }
    return {text: text || i18nList('button_retry'), buttonProps, handler};
};

export const ErrorView = ({
    error,
    scope,
    action: propsAction,
    className,
    title,
    description,
    showDebugInfo,
}: ErrorViewProps) => {
    const {requestId, traceId, status} = Utils.parseErrorResponse(error);
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();
    let action: ErrorContentAction | undefined;

    if (propsAction) {
        action = getErrorAction(propsAction);
    }

    return (
        <div className={b({'with-aside-header': isAsideHeaderEnabled}, className)}>
            <ErrorContent
                {...getErrorData({status, scope, title, description})}
                reqId={requestId}
                traceId={traceId}
                action={action}
                showDebugInfo={showDebugInfo}
            />
        </div>
    );
};
