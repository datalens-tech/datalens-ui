import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import isEmpty from 'lodash/isEmpty';
import type {StringParams} from 'shared';

import type DatalensChartkitCustomError from '../../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import More from './More/More';

import './Error.scss';

const b = block('chartkit-error');

export interface ErrorProps {
    error: DatalensChartkitCustomError;
    onAction: (data?: {params: StringParams}) => void;
}

const Error: React.FC<ErrorProps> = (props) => {
    const {error, onAction} = props;

    const {
        message,
        details,
        debug: {requestId},
        extra: {hideRetry, openedMore, actionText, actionData},
    } = error;

    const more = isEmpty(details) ? null : details;
    const showMore = more && !openedMore;
    const showRetry = !hideRetry;
    const hideControls = !showMore && !showRetry;

    return (
        <div className={b()}>
            <div className={b('title')}>{message}</div>
            {more && openedMore && (
                <More
                    message={message}
                    requestId={requestId}
                    more={more}
                    opened={true}
                    className={b('more')}
                />
            )}
            {!hideControls && (
                <div className={b('actions')}>
                    {showRetry && (
                        <Button className={b('action')} onClick={() => onAction(actionData)}>
                            {actionText}
                        </Button>
                    )}
                    {showMore && (
                        <More
                            message={message}
                            requestId={requestId}
                            more={more!}
                            className={b('action')}
                        />
                    )}
                </div>
            )}
            {requestId && <div className={b('request-id')}>{requestId}</div>}
        </div>
    );
};

export default React.memo<ErrorProps>(Error);
