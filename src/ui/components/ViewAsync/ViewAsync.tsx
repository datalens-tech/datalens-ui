import React from 'react';

import block from 'bem-cn-lite';

import type {ViewErrorProps} from '../ViewError/ViewError';
import {ViewError} from '../ViewError/ViewError';
import type {ViewLoaderProps} from '../ViewLoader/ViewLoader';
import {ViewLoader} from '../ViewLoader/ViewLoader';

import './ViewAsync.scss';

export enum Status {
    Loading = 'loading',
    Failed = 'failed',
    Success = 'success',
}

export interface ViewAsyncProps {
    status: 'loading' | 'failed' | 'success';
    children?: React.ReactNode;
    className?: string;
    classNameLoader?: ViewLoaderProps['className'];
    loaderText?: ViewLoaderProps['text'];
    loaderSize?: ViewLoaderProps['size'];
    classNameError?: ViewErrorProps['actionsClassName'];
    buttonErrorText?: ViewErrorProps['buttonText'];
    errorText?: ViewErrorProps['title'];
    onRetry?: ViewErrorProps['retry'];
    error?: ViewErrorProps['error'];
    withReport?: ViewErrorProps['withReport'];
}

const b = block('dl-view-async');

export const ViewAsync: React.FC<ViewAsyncProps> = ({
    status,
    children,
    className,
    classNameLoader,
    loaderText,
    loaderSize,
    classNameError,
    buttonErrorText,
    errorText,
    onRetry,
    error,
    withReport,
}: ViewAsyncProps) => {
    return (
        <div className={b(null, className)}>
            {status === Status.Success && children}
            {status === Status.Loading && (
                <ViewLoader className={classNameLoader} text={loaderText} size={loaderSize} />
            )}
            {status === Status.Failed && (
                <ViewError
                    actionsClassName={classNameError}
                    buttonText={buttonErrorText}
                    title={errorText}
                    retry={onRetry}
                    error={error}
                    withReport={withReport}
                />
            )}
        </div>
    );
};
