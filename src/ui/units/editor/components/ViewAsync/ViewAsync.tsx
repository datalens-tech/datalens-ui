import React from 'react';

import block from 'bem-cn-lite';

import {Status} from '../../constants/common';
import {ViewError} from '../ViewError/ViewError';
import type {ViewLoaderProps} from '../ViewLoader/ViewLoader';
import {ViewLoader} from '../ViewLoader/ViewLoader';

import './ViewAsync.scss';

export interface ViewAsyncProps {
    status: Status;
    children: React.ReactNode;
    className?: string;
    classNameLoader?: string;
    loaderText?: string;
    loaderSize?: ViewLoaderProps['size'];
    classNameError?: string;
    buttonErrorText?: string;
    errorText?: string;
    onRetry: () => void;
}

const b = block('editor-view-async');

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
}: ViewAsyncProps) => {
    return (
        <div className={b(null, className)}>
            {status === Status.Success && children}
            {status === Status.Loading && (
                <ViewLoader className={classNameLoader} text={loaderText} size={loaderSize} />
            )}
            {status === Status.Failed && (
                <ViewError
                    className={classNameError}
                    buttonText={buttonErrorText}
                    errorText={errorText}
                    onClick={onRetry}
                />
            )}
        </div>
    );
};
