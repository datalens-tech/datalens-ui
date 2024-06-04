import React from 'react';

import type {LoaderProps} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ViewLoader.scss';

export interface ViewLoaderProps {
    size?: LoaderProps['size'];
    text?: string;
    className?: string;
}

const b = block('editor-view-loader');

export const ViewLoader: React.FC<ViewLoaderProps> = ({
    className,
    size = 'm',
    text,
}: ViewLoaderProps) => {
    return (
        <div className={b(null, className)}>
            <Loader size={size} />
            {text ? <div className={b('text')}>{text}</div> : null}
        </div>
    );
};
